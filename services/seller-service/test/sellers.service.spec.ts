import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@fincommerce/common';
import { SellerStatus } from '../generated/prisma';
import { SellersService } from '../src/sellers/sellers.service';

describe('SellersService', () => {
  let prisma: any;
  let service: SellersService;

  const now = new Date('2026-05-04T00:00:00.000Z');
  const application = {
    id: 'application-1',
    userId: 'user-1',
    email: 'customer@example.com',
    shopName: 'Demo Shop',
    businessName: 'Demo LLC',
    businessPhone: '+84901234567',
    taxCode: '0312345678',
    description: 'Demo seller',
    status: SellerStatus.PENDING,
    reviewNote: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: now,
    updatedAt: now
  };
  const profile = {
    id: 'seller-1',
    userId: 'user-1',
    email: 'customer@example.com',
    shopName: 'Demo Shop',
    businessName: 'Demo LLC',
    businessPhone: '+84901234567',
    taxCode: '0312345678',
    description: 'Demo seller',
    status: SellerStatus.APPROVED,
    createdAt: now,
    updatedAt: now
  };

  beforeEach(() => {
    prisma = {
      sellerApplication: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      sellerProfile: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      sellerStatusHistory: {
        create: jest.fn()
      },
      $transaction: jest.fn((callback: (tx: any) => Promise<unknown>) =>
        callback(prisma)
      )
    };

    service = new SellersService(prisma);
  });

  it('allows customers to apply as sellers', async () => {
    prisma.sellerProfile.findUnique.mockResolvedValue(null);
    prisma.sellerApplication.findUnique.mockResolvedValue(null);
    prisma.sellerApplication.create.mockResolvedValue(application);

    const result = await service.apply(
      'user-1',
      'customer@example.com',
      UserRole.CUSTOMER,
      {
        shopName: 'Demo Shop',
        businessName: 'Demo LLC',
        businessPhone: '+84901234567',
        taxCode: '0312345678',
        description: 'Demo seller'
      }
    );

    expect(result.eventType).toBe('SellerApplied');
    expect(prisma.sellerApplication.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        shopName: 'Demo Shop'
      })
    });
  });

  it('rejects non-customer seller applications', async () => {
    await expect(
      service.apply('admin-1', 'admin@example.com', UserRole.ADMIN, {
        shopName: 'Demo Shop',
        businessPhone: '+84901234567'
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects duplicate active applications', async () => {
    prisma.sellerProfile.findUnique.mockResolvedValue(null);
    prisma.sellerApplication.findUnique.mockResolvedValue(application);

    await expect(
      service.apply('user-1', 'customer@example.com', UserRole.CUSTOMER, {
        shopName: 'Demo Shop',
        businessPhone: '+84901234567'
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('approves a pending application and creates seller profile', async () => {
    prisma.sellerApplication.findUnique.mockResolvedValue(application);
    prisma.sellerApplication.update.mockResolvedValue({
      ...application,
      status: SellerStatus.APPROVED
    });
    prisma.sellerProfile.create.mockResolvedValue(profile);
    prisma.sellerStatusHistory.create.mockResolvedValue({});

    const result = await service.approve('application-1', 'admin-1', {
      note: 'Approved'
    });

    expect(result.eventType).toBe('SellerApproved');
    expect(prisma.sellerProfile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        status: SellerStatus.APPROVED
      })
    });
    expect(prisma.sellerStatusHistory.create).toHaveBeenCalled();
  });

  it('rejects missing pending applications', async () => {
    prisma.sellerApplication.findUnique.mockResolvedValue(null);

    await expect(
      service.reject('missing-application', 'admin-1', { note: 'Invalid' })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('suspends an approved seller profile', async () => {
    prisma.sellerProfile.findUnique.mockResolvedValue(profile);
    prisma.sellerProfile.update.mockResolvedValue({
      ...profile,
      status: SellerStatus.SUSPENDED
    });
    prisma.sellerStatusHistory.create.mockResolvedValue({});

    const result = await service.suspend('seller-1', 'admin-1', {
      note: 'Policy violation'
    });

    expect(result.eventType).toBe('SellerSuspended');
    expect(prisma.sellerStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fromStatus: SellerStatus.APPROVED,
        toStatus: SellerStatus.SUSPENDED
      })
    });
  });
});
