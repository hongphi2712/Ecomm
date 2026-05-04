import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ErrorCodes, UserRole } from '@fincommerce/common';
import { SellerApplication, SellerProfile, SellerStatus } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { ReviewSellerDto } from './dto/review-seller.dto';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, email: string | undefined, role: UserRole, dto: ApplySellerDto) {
    if (role !== UserRole.CUSTOMER) {
      throw new ForbiddenException({
        message: 'Only customers can apply to become sellers',
        errorCode: ErrorCodes.FORBIDDEN
      });
    }

    const existingProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException({
        message: 'Seller profile already exists',
        errorCode: ErrorCodes.CONFLICT
      });
    }

    const existingApplication = await this.prisma.sellerApplication.findUnique({
      where: { userId }
    });

    if (existingApplication && existingApplication.status !== SellerStatus.REJECTED) {
      throw new ConflictException({
        message: 'Seller application already exists',
        errorCode: ErrorCodes.CONFLICT
      });
    }

    const application = existingApplication
      ? await this.prisma.sellerApplication.update({
          where: { id: existingApplication.id },
          data: {
            email: email ?? existingApplication.email,
            shopName: dto.shopName,
            businessName: dto.businessName,
            businessPhone: dto.businessPhone,
            taxCode: dto.taxCode,
            description: dto.description,
            status: SellerStatus.PENDING,
            reviewNote: null,
            reviewedBy: null,
            reviewedAt: null
          }
        })
      : await this.prisma.sellerApplication.create({
          data: {
            userId,
            email: email ?? '',
            shopName: dto.shopName,
            businessName: dto.businessName,
            businessPhone: dto.businessPhone,
            taxCode: dto.taxCode,
            description: dto.description
          }
        });

    return {
      eventType: 'SellerApplied',
      application: this.toApplicationResponse(application)
    };
  }

  async getMe(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId }
    });

    if (profile) {
      return {
        profile: this.toProfileResponse(profile),
        application: null
      };
    }

    const application = await this.prisma.sellerApplication.findUnique({
      where: { userId }
    });

    if (!application) {
      throw new NotFoundException({
        message: 'Seller profile not found',
        errorCode: ErrorCodes.NOT_FOUND
      });
    }

    return {
      profile: null,
      application: this.toApplicationResponse(application)
    };
  }

  async getPendingApplications() {
    const applications = await this.prisma.sellerApplication.findMany({
      where: { status: SellerStatus.PENDING },
      orderBy: { createdAt: 'asc' }
    });

    return applications.map((application) => this.toApplicationResponse(application));
  }

  async approve(applicationId: string, adminId: string, dto: ReviewSellerDto) {
    const application = await this.findPendingApplication(applicationId);

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.sellerApplication.update({
        where: { id: application.id },
        data: {
          status: SellerStatus.APPROVED,
          reviewNote: dto.note,
          reviewedBy: adminId,
          reviewedAt: new Date()
        }
      });

      const seller = await tx.sellerProfile.create({
        data: {
          userId: application.userId,
          email: application.email,
          shopName: application.shopName,
          businessName: application.businessName,
          businessPhone: application.businessPhone,
          taxCode: application.taxCode,
          description: application.description,
          status: SellerStatus.APPROVED
        }
      });

      await tx.sellerStatusHistory.create({
        data: {
          sellerId: seller.id,
          fromStatus: null,
          toStatus: SellerStatus.APPROVED,
          reason: dto.note,
          changedBy: adminId
        }
      });

      return { updatedApplication, seller };
    });

    return {
      eventType: 'SellerApproved',
      application: this.toApplicationResponse(result.updatedApplication),
      profile: this.toProfileResponse(result.seller)
    };
  }

  async reject(applicationId: string, adminId: string, dto: ReviewSellerDto) {
    const application = await this.findPendingApplication(applicationId);
    const updatedApplication = await this.prisma.sellerApplication.update({
      where: { id: application.id },
      data: {
        status: SellerStatus.REJECTED,
        reviewNote: dto.note,
        reviewedBy: adminId,
        reviewedAt: new Date()
      }
    });

    return {
      eventType: 'SellerRejected',
      application: this.toApplicationResponse(updatedApplication)
    };
  }

  async suspend(sellerId: string, adminId: string, dto: ReviewSellerDto) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerId }
    });

    if (!seller) {
      throw new NotFoundException({
        message: 'Seller profile not found',
        errorCode: ErrorCodes.NOT_FOUND
      });
    }

    const updatedSeller = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.sellerProfile.update({
        where: { id: seller.id },
        data: { status: SellerStatus.SUSPENDED }
      });

      await tx.sellerStatusHistory.create({
        data: {
          sellerId: seller.id,
          fromStatus: seller.status,
          toStatus: SellerStatus.SUSPENDED,
          reason: dto.note,
          changedBy: adminId
        }
      });

      return updated;
    });

    return {
      eventType: 'SellerSuspended',
      profile: this.toProfileResponse(updatedSeller)
    };
  }

  private async findPendingApplication(applicationId: string) {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application || application.status !== SellerStatus.PENDING) {
      throw new NotFoundException({
        message: 'Pending seller application not found',
        errorCode: ErrorCodes.NOT_FOUND
      });
    }

    return application;
  }

  private toApplicationResponse(application: SellerApplication) {
    return {
      id: application.id,
      userId: application.userId,
      email: application.email,
      shopName: application.shopName,
      businessName: application.businessName,
      businessPhone: application.businessPhone,
      taxCode: application.taxCode,
      description: application.description,
      status: application.status,
      reviewNote: application.reviewNote,
      reviewedBy: application.reviewedBy,
      reviewedAt: application.reviewedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };
  }

  private toProfileResponse(profile: SellerProfile) {
    return {
      id: profile.id,
      userId: profile.userId,
      email: profile.email,
      shopName: profile.shopName,
      businessName: profile.businessName,
      businessPhone: profile.businessPhone,
      taxCode: profile.taxCode,
      description: profile.description,
      status: profile.status,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  }
}
