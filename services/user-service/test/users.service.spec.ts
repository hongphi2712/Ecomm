import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../src/users/users.service';

describe('UsersService', () => {
  let prisma: any;
  let service: UsersService;

  const now = new Date('2026-05-04T00:00:00.000Z');
  const profile = {
    id: 'profile-1',
    userId: 'user-1',
    email: 'customer@example.com',
    fullName: 'Customer',
    phone: null,
    avatarUrl: null,
    dateOfBirth: null,
    createdAt: now,
    updatedAt: now
  };
  const address = {
    id: 'address-1',
    userId: 'user-1',
    label: 'Home',
    recipientName: 'Customer',
    phone: '+84901234567',
    province: 'Ho Chi Minh',
    district: 'District 1',
    ward: 'Ben Nghe',
    detail: '123 Le Loi',
    isDefault: true,
    createdAt: now,
    updatedAt: now
  };

  beforeEach(() => {
    prisma = {
      userProfile: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      userAddress: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn()
      }
    };

    service = new UsersService(prisma);
  });

  it('creates a profile lazily for the current user', async () => {
    prisma.userProfile.findUnique.mockResolvedValue(null);
    prisma.userProfile.create.mockResolvedValue(profile);

    const result = await service.getMe('user-1', 'customer@example.com');

    expect(prisma.userProfile.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        email: 'customer@example.com',
        fullName: 'customer@example.com'
      }
    });
    expect(result.email).toBe('customer@example.com');
  });

  it('updates only the current user profile', async () => {
    prisma.userProfile.findUnique.mockResolvedValue(profile);
    prisma.userProfile.update.mockResolvedValue({
      ...profile,
      fullName: 'Updated Customer'
    });

    const result = await service.updateMe('user-1', 'customer@example.com', {
      fullName: 'Updated Customer'
    });

    expect(prisma.userProfile.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: expect.objectContaining({
        fullName: 'Updated Customer'
      })
    });
    expect(result.fullName).toBe('Updated Customer');
  });

  it('creates a default address for the current user', async () => {
    prisma.userProfile.findUnique.mockResolvedValue(profile);
    prisma.userAddress.updateMany.mockResolvedValue({ count: 0 });
    prisma.userAddress.create.mockResolvedValue(address);

    const result = await service.createAddress('user-1', 'customer@example.com', {
      label: 'Home',
      recipientName: 'Customer',
      phone: '+84901234567',
      province: 'Ho Chi Minh',
      district: 'District 1',
      ward: 'Ben Nghe',
      detail: '123 Le Loi',
      isDefault: true
    });

    expect(prisma.userAddress.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        isDefault: true
      },
      data: {
        isDefault: false
      }
    });
    expect(result.isDefault).toBe(true);
  });

  it('rejects updating another user address', async () => {
    prisma.userAddress.findFirst.mockResolvedValue(null);

    await expect(
      service.updateAddress('user-1', 'address-2', { label: 'Office' })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
