import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+84337415627' })
  @IsOptional()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: '1995-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
