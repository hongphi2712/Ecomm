import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class ApplySellerDto {
  @ApiProperty({ example: 'FinCommerce Demo Shop' })
  @IsString()
  @MinLength(2)
  shopName!: string;

  @ApiPropertyOptional({ example: 'FinCommerce Demo LLC' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ example: '+84901234567' })
  @IsPhoneNumber()
  businessPhone!: string;

  @ApiPropertyOptional({ example: '0312345678' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({ example: 'Official store for demo products.' })
  @IsOptional()
  @IsString()
  description?: string;
}
