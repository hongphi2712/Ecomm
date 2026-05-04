import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginResult, OtpPurpose, User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ErrorCodes, RequestWithContext } from '@fincommerce/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenService } from './auth-token.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthUserResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authTokenService: AuthTokenService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException({
        message: 'Email already exists',
        errorCode: ErrorCodes.CONFLICT
      });
    }

    const passwordHash = await this.hashSecret(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE
      }
    });

    return this.toUserResponse(user);
  }

  async login(dto: LoginDto, request?: RequestWithContext) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      await this.recordLoginHistory(null, email, LoginResult.FAILED, request);
      throw this.invalidCredentials();
    }

    if (this.isAccountLocked(user)) {
      await this.recordLoginHistory(user.id, email, LoginResult.LOCKED, request);
      throw new UnauthorizedException({
        message: 'Account is locked',
        errorCode: ErrorCodes.ACCOUNT_LOCKED
      });
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      await this.handleFailedLogin(user, request);
      throw this.invalidCredentials();
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    if (this.requiresOtp(user)) {
      await this.createOtp(user.id, OtpPurpose.LOGIN_2FA);
      await this.recordLoginHistory(user.id, email, LoginResult.OTP_REQUIRED, request);

      return {
        otpRequired: true,
        user: this.toUserResponse(user)
      };
    }

    await this.recordLoginHistory(user.id, email, LoginResult.SUCCESS, request);
    return this.issueTokenPair(user);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw this.invalidCredentials();
    }

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        purpose: OtpPurpose.LOGIN_2FA,
        consumedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otp || !(await bcrypt.compare(dto.code, otp.codeHash))) {
      throw new UnauthorizedException({
        message: 'Invalid OTP',
        errorCode: ErrorCodes.UNAUTHORIZED
      });
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() }
    });

    return this.issueTokenPair(user);
  }

  async refreshToken(refreshToken: string) {
    const rotated = await this.authTokenService.rotateRefreshToken(refreshToken);

    return {
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      user: this.toUserResponse(rotated.user)
    };
  }

  async logout(refreshToken: string) {
    await this.authTokenService.revokeRefreshToken(refreshToken);
    return { loggedOut: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      await this.createOtp(user.id, OtpPurpose.PASSWORD_RESET);
    }

    return { accepted: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCodes.NOT_FOUND
      });
    }

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        purpose: OtpPurpose.PASSWORD_RESET,
        consumedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otp || !(await bcrypt.compare(dto.code, otp.codeHash))) {
      throw new UnauthorizedException({
        message: 'Invalid OTP',
        errorCode: ErrorCodes.UNAUTHORIZED
      });
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await this.hashSecret(dto.newPassword),
          failedLoginAttempts: 0,
          lockedUntil: null
        }
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() }
      })
    ]);

    return { reset: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCodes.NOT_FOUND
      });
    }

    return this.toUserResponse(user);
  }

  async syncProfile(userId: string, data: { fullName?: string; phone?: string }) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone
      }
    });
  }

  private async issueTokenPair(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.authTokenService.createAccessToken(user),
      this.authTokenService.createRefreshToken(user.id)
    ]);

    return {
      accessToken,
      refreshToken,
      user: this.toUserResponse(user)
    };
  }

  private async handleFailedLogin(user: User, request?: RequestWithContext) {
    const maxAttempts = this.getNumberConfig('ACCOUNT_LOCK_MAX_FAILED_ATTEMPTS', 5);
    const lockMinutes = this.getNumberConfig('ACCOUNT_LOCK_MINUTES', 15);
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const shouldLock = failedLoginAttempts >= maxAttempts;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + lockMinutes * 60 * 1000)
          : null
      }
    });

    await this.recordLoginHistory(user.id, user.email, LoginResult.FAILED, request);
  }

  private async createOtp(userId: string, purpose: OtpPurpose) {
    const code = this.generateOtpCode();
    const codeHash = await this.hashSecret(code);
    const expiresInMinutes = this.getNumberConfig('OTP_EXPIRES_IN_MINUTES', 5);

    await this.prisma.otpCode.create({
      data: {
        userId,
        purpose,
        codeHash,
        expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000)
      }
    });

    return code;
  }

  private async recordLoginHistory(
    userId: string | null,
    email: string,
    result: LoginResult,
    request?: RequestWithContext
  ) {
    await this.prisma.loginHistory.create({
      data: {
        userId,
        email,
        result,
        ipAddress: request?.ip,
        userAgent: request?.header('user-agent'),
        correlationId: request?.correlationId
      }
    });
  }

  private isAccountLocked(user: User): boolean {
    return Boolean(user.lockedUntil && user.lockedUntil > new Date());
  }

  private requiresOtp(user: User): boolean {
    const otpRoles: UserRole[] = [
      UserRole.ADMIN,
      UserRole.SELLER,
      UserRole.SUPPORT
    ];

    return user.isTwoFactorEnabled && otpRoles.includes(user.role);
  }

  private invalidCredentials() {
    return new UnauthorizedException({
      message: 'Invalid email or password',
      errorCode: ErrorCodes.UNAUTHORIZED
    });
  }

  private async hashSecret(secret: string): Promise<string> {
    const saltRounds = this.getNumberConfig('BCRYPT_SALT_ROUNDS', 12);
    return bcrypt.hash(secret, saltRounds);
  }

  private getNumberConfig(key: string, defaultValue: number): number {
    const value = this.configService.get<string | number>(key, defaultValue);
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  private generateOtpCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toUserResponse(user: User): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
