import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from '@fincommerce/common';
import { UserAddress, UserProfile } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string, email: string) {
    const profile = await this.ensureProfile(userId, email);
    return this.toProfileResponse(profile);
  }

  async updateMe(userId: string, email: string, dto: UpdateProfileDto) {
    await this.ensureProfile(userId, email);

    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        email,
        fullName: dto.fullName,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined
      }
    });

    return this.toProfileResponse(profile);
  }

  async createAddress(userId: string, email: string, dto: CreateAddressDto) {
    await this.ensureProfile(userId, email);

    if (dto.isDefault) {
      await this.clearDefaultAddresses(userId);
    }

    const address = await this.prisma.userAddress.create({
      data: {
        userId,
        label: dto.label,
        recipientName: dto.recipientName,
        phone: dto.phone,
        province: dto.province,
        district: dto.district,
        ward: dto.ward,
        detail: dto.detail,
        isDefault: dto.isDefault ?? false
      }
    });

    return this.toAddressResponse(address);
  }

  async listAddresses(userId: string) {
    const addresses = await this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return addresses.map((address) => this.toAddressResponse(address));
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    await this.findOwnedAddress(userId, addressId);

    if (dto.isDefault) {
      await this.clearDefaultAddresses(userId);
    }

    const address = await this.prisma.userAddress.update({
      where: { id: addressId },
      data: {
        label: dto.label,
        recipientName: dto.recipientName,
        phone: dto.phone,
        province: dto.province,
        district: dto.district,
        ward: dto.ward,
        detail: dto.detail,
        isDefault: dto.isDefault
      }
    });

    return this.toAddressResponse(address);
  }

  async deleteAddress(userId: string, addressId: string) {
    await this.findOwnedAddress(userId, addressId);
    await this.prisma.userAddress.delete({ where: { id: addressId } });

    return { deleted: true };
  }

  private async ensureProfile(userId: string, email: string): Promise<UserProfile> {
    const existing = await this.prisma.userProfile.findUnique({ where: { userId } });

    if (existing) {
      return existing;
    }

    return this.prisma.userProfile.create({
      data: {
        userId,
        email,
        fullName: email
      }
    });
  }

  private async findOwnedAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new NotFoundException({
        message: 'Address not found',
        errorCode: ErrorCodes.NOT_FOUND
      });
    }

    return address;
  }

  private async clearDefaultAddresses(userId: string) {
    await this.prisma.userAddress.updateMany({
      where: {
        userId,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    });
  }

  private toProfileResponse(profile: UserProfile) {
    return {
      id: profile.id,
      userId: profile.userId,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      dateOfBirth: profile.dateOfBirth,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  }

  private toAddressResponse(address: UserAddress) {
    return {
      id: address.id,
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detail: address.detail,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt
    };
  }
}
