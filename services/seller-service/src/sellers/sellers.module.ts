import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminSellersController, SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';

@Module({
  imports: [AuthModule],
  controllers: [SellersController, AdminSellersController],
  providers: [SellersService]
})
export class SellersModule {}
