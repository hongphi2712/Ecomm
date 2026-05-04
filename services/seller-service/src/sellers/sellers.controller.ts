import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, RolesGuard, UserRole } from '@fincommerce/common';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { ReviewSellerDto } from './dto/review-seller.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { SellersService } from './sellers.service';

@ApiTags('sellers')
@Controller('sellers')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class SellersController {
  constructor(private readonly sellersService: SellersService) {
  }

  @Post('apply')
  apply(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: ApplySellerDto
  ) {
    return this.sellersService.apply(userId, email, role, dto);
  }

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.sellersService.getMe(userId);
  }
}

@ApiTags('admin sellers')
@Controller('admin/sellers')
@UseGuards(AccessTokenGuard, RolesGuard)
@ApiBearerAuth()
export class AdminSellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get('pending')
  @Roles(UserRole.ADMIN)
  getPending() {
    return this.sellersService.getPendingApplications();
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  approve(
    @Param('id') applicationId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ReviewSellerDto
  ) {
    return this.sellersService.approve(applicationId, adminId, dto);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  reject(
    @Param('id') applicationId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ReviewSellerDto
  ) {
    return this.sellersService.reject(applicationId, adminId, dto);
  }

  @Post(':id/suspend')
  @Roles(UserRole.ADMIN)
  suspend(
    @Param('id') sellerId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ReviewSellerDto
  ) {
    return this.sellersService.suspend(sellerId, adminId, dto);
  }
}
