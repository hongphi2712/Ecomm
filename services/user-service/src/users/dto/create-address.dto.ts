import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  recipientName!: string;

  @ApiProperty({ example: '+84901234567' })
  @IsPhoneNumber()
  phone!: string;

  @ApiProperty({ example: 'Ho Chi Minh' })
  @IsString()
  province!: string;

  @ApiProperty({ example: 'District 1' })
  @IsString()
  district!: string;

  @ApiProperty({ example: 'Ben Nghe' })
  @IsString()
  ward!: string;

  @ApiProperty({ example: '123 Le Loi' })
  @IsString()
  detail!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
