import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginResult, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService', () => {
  let prisma: any;
  let tokenService: any;
  let service: AuthService;

  const now = new Date('2026-05-03T00:00:00.000Z');

  const user = {
    id: 'user-1',
    email: 'customer@example.com',
    passwordHash: bcrypt.hashSync('Password123', 4),
    fullName: 'Customer A',
    phone: null,
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    isEmailVerified: false,
    isTwoFactorEnabled: false,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      otpCode: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn()
      },
      loginHistory: {
        create: jest.fn()
      },
      $transaction: jest.fn((operations: unknown[]) => Promise.all(operations))
    };
    tokenService = {
      createAccessToken: jest.fn().mockResolvedValue('access-token'),
      createRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
      rotateRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn()
    };
    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const values: Record<string, unknown> = {
          BCRYPT_SALT_ROUNDS: 4,
          ACCOUNT_LOCK_MAX_FAILED_ATTEMPTS: 5,
          ACCOUNT_LOCK_MINUTES: 15,
          OTP_EXPIRES_IN_MINUTES: 5
        };

        return values[key] ?? defaultValue;
      })
    } as unknown as ConfigService;

    service = new AuthService(prisma, tokenService, configService);
  });

  it('registers a customer with normalized unique email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);

    const result = await service.register({
      email: 'Customer@Example.com',
      password: 'Password123',
      fullName: 'Customer A'
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'customer@example.com' }
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'customer@example.com',
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE
        })
      })
    );
    expect(result.email).toBe('customer@example.com');
  });

  it('rejects duplicate email registration', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.register({
        email: 'customer@example.com',
        password: 'Password123',
        fullName: 'Customer A'
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in and returns token pair', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue(user);

    const result = (await service.login({
      email: 'customer@example.com',
      password: 'Password123'
    })) as { accessToken: string; refreshToken: string };

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(prisma.loginHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        result: LoginResult.SUCCESS
      })
    });
  });

  it('increments failed attempts on wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue({ ...user, failedLoginAttempts: 1 });

    await expect(
      service.login({
        email: 'customer@example.com',
        password: 'WrongPassword123'
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: expect.objectContaining({
        failedLoginAttempts: 1
      })
    });
  });

  it('locks account after five failed attempts', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      failedLoginAttempts: 4
    });
    prisma.user.update.mockResolvedValue({ ...user, failedLoginAttempts: 5 });

    await expect(
      service.login({
        email: 'customer@example.com',
        password: 'WrongPassword123'
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: expect.objectContaining({
        failedLoginAttempts: 5,
        lockedUntil: expect.any(Date)
      })
    });
  });

  it('refreshes token through rotation service', async () => {
    tokenService.rotateRefreshToken.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user
    });

    const result = await service.refreshToken('old-refresh-token');

    expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith('old-refresh-token');
    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
  });

  it('rejects reused old refresh token', async () => {
    tokenService.rotateRefreshToken.mockRejectedValue(
      new UnauthorizedException({
        message: 'Invalid refresh token',
        errorCode: 'UNAUTHORIZED'
      })
    );

    await expect(service.refreshToken('old-refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });
});
