import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../src/users/users.service';

describe('UsersService Security (IDOR & Auth)', () => {
  let prisma: any;
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      userProfile: {
        findUnique: jest.fn(),
        update: jest.fn()
      },
      userAddress: {
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    };
    const kafkaClient = {
      emit: jest.fn()
    };
    service = new UsersService(prisma, kafkaClient as any);
  });

  describe('IDOR Prevention', () => {
    it('should strictly update profile only for the authenticated userId', async () => {
      const authUserId = 'user-1';
      const targetUserId = 'user-1'; // Same as auth

      prisma.userProfile.findUnique.mockResolvedValue({ userId: targetUserId });
      prisma.userProfile.update.mockResolvedValue({ userId: targetUserId, fullName: 'New Name' });

      await service.updateMe(authUserId, 'test@test.com', { fullName: 'New Name' });

      // Ensure the WHERE clause uses the authenticated user's ID
      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { userId: authUserId },
        data: expect.any(Object)
      });
    });

    it('should reject address updates for addresses not belonging to the user', async () => {
      const authUserId = 'user-1';
      const targetAddressId = 'address-of-user-2';

      // Mock that the address is NOT found for user-1
      prisma.userAddress.findFirst.mockResolvedValue(null);

      await expect(
        service.updateAddress(authUserId, targetAddressId, { label: 'Hacked' })
      ).rejects.toThrow(NotFoundException);

      expect(prisma.userAddress.update).not.toHaveBeenCalled();
    });

    it('should reject address deletion for addresses not belonging to the user', async () => {
      const authUserId = 'user-1';
      const targetAddressId = 'address-of-user-2';

      prisma.userAddress.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteAddress(authUserId, targetAddressId)
      ).rejects.toThrow(NotFoundException);

      expect(prisma.userAddress.delete).not.toHaveBeenCalled();
    });
  });
});
