import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService Security Tests', () => {
  let prisma: any;
  let tokenService: any;
  let service: AuthService;

  const now = new Date('2026-05-04T00:00:00.000Z');

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      loginHistory: {
        create: jest.fn()
      }
    };
    tokenService = {
      createAccessToken: jest.fn().mockResolvedValue('access-token'),
      createRefreshToken: jest.fn().mockResolvedValue('refresh-token')
    };
    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const values: Record<string, unknown> = {
          BCRYPT_SALT_ROUNDS: 12,
          ACCOUNT_LOCK_MAX_FAILED_ATTEMPTS: 3 // Strict for testing
        };
        return values[key] ?? defaultValue;
      })
    } as unknown as ConfigService;

    service = new AuthService(prisma, tokenService, configService);
  });

  describe('Password Security', () => {
    it('should hash passwords and not store plain text', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation((args: any) => Promise.resolve({
        ...args.data,
        id: 'user-1',
        createdAt: now,
        updatedAt: now
      }));

      const plainPassword = 'SuperSecretPassword123!';
      const result = await service.register({
        email: 'security@test.com',
        password: plainPassword,
        fullName: 'Security Tester'
      });

      // Verify passwordHash is NOT plain text
      const capturedData = prisma.user.create.mock.calls[0][0].data;
      expect(capturedData.passwordHash).not.toBe(plainPassword);
      expect(capturedData.passwordHash.startsWith('$2a$')).toBe(true); // bcrypt prefix
      
      // Verify it can be compared correctly
      const isMatch = await bcrypt.compare(plainPassword, capturedData.passwordHash);
      expect(isMatch).toBe(true);
    });

    it('should NEVER return passwordHash in the response', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'SECRET_HASH',
        fullName: 'Test',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'Password123',
        fullName: 'Test'
      });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('Account Protection (Brute Force)', () => {
    it('should lock account after multiple failed attempts', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'victim@test.com',
        passwordHash: await bcrypt.hash('CorrectPassword', 10),
        failedLoginAttempts: 2,
        lockedUntil: null
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      
      // 3rd failed attempt (threshold is 3 in this test)
      await expect(service.login({
        email: 'victim@test.com',
        password: 'WrongPassword'
      })).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          failedLoginAttempts: 3,
          lockedUntil: expect.any(Date)
        })
      });
    });

    it('should reject login if account is currently locked', async () => {
      const lockedUser = {
        id: 'user-1',
        email: 'locked@test.com',
        passwordHash: 'hash',
        lockedUntil: new Date(Date.now() + 10000) // Locked for 10s
      };

      prisma.user.findUnique.mockResolvedValue(lockedUser);

      await expect(service.login({
        email: 'locked@test.com',
        password: 'AnyPassword'
      })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Input Sanitization & Injection Prevention', () => {
    it('should handle XSS-like payloads in fullName safely', async () => {
      const xssPayload = '<script>alert("xss")</script><b>Tester</b>';
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation((args: any) => Promise.resolve({
        ...args.data,
        id: 'user-1'
      }));

      const result = await service.register({
        email: 'xss@test.com',
        password: 'Password123',
        fullName: xssPayload
      });

      // Prisma/Postgres handles the storage safely, but we check the data is kept as is
      // (Next.js will escape it on render)
      expect(result.fullName).toBe(xssPayload);
    });
  });
});
