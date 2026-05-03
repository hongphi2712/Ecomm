import { randomBytes, createHash } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser, JwtVerifier, UserRole } from '@fincommerce/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthTokenService implements JwtVerifier {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    try {
      return await this.jwtService.verifyAsync<AuthenticatedUser>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')
      });
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid access token',
        errorCode: 'UNAUTHORIZED'
      });
    }
  }

  async createAccessToken(user: {
    id: string;
    email: string;
    role: UserRole | string;
  }): Promise<string> {
    const expiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m'
    );

    return this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: expiresIn as never
      }
    );
  }

  async createRefreshToken(userId: string): Promise<string> {
    const refreshToken = randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + this.getRefreshTokenTtlMs()
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt
      }
    });

    return refreshToken;
  }

  async rotateRefreshToken(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
        errorCode: 'UNAUTHORIZED'
      });
    }

    const nextRefreshToken = randomBytes(48).toString('base64url');
    const nextTokenHash = this.hashToken(nextRefreshToken);
    const expiresAt = new Date(Date.now() + this.getRefreshTokenTtlMs());

    const nextStoredToken = await this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: {
          userId: storedToken.userId,
          tokenHash: nextTokenHash,
          expiresAt
        }
      });

      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          revokedAt: new Date(),
          replacedByTokenId: created.id
        }
      });

      return created;
    });

    const accessToken = await this.createAccessToken(storedToken.user);

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      refreshTokenId: nextStoredToken.id,
      user: storedToken.user
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash }
    });

    if (!storedToken || storedToken.revokedAt) {
      return;
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenTtlMs(): number {
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const match = expiresIn.match(/^(\d+)([dhm])$/);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2];

    if (unit === 'd') return value * 24 * 60 * 60 * 1000;
    if (unit === 'h') return value * 60 * 60 * 1000;
    return value * 60 * 1000;
  }
}
