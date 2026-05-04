import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'Password123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({ example: '+84337415627' })
  @IsOptional()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'phone must be a valid phone number' })
  phone?: string;
}
