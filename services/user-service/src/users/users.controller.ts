import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@fincommerce/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string, @CurrentUser('email') email: string) {
    return this.usersService.getMe(userId, email);
  }

  @Patch('me')
  updateMe(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.usersService.updateMe(userId, email, dto);
  }

  @Post('addresses')
  createAddress(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: CreateAddressDto
  ) {
    return this.usersService.createAddress(userId, email, dto);
  }

  @Get('addresses')
  listAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.listAddresses(userId);
  }

  @Patch('addresses/:id')
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto
  ) {
    return this.usersService.updateAddress(userId, addressId, dto);
  }

  @Delete('addresses/:id')
  deleteAddress(@CurrentUser('id') userId: string, @Param('id') addressId: string) {
    return this.usersService.deleteAddress(userId, addressId);
  }
}
