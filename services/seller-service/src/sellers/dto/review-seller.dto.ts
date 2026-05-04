import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReviewSellerDto {
  @ApiPropertyOptional({ example: 'Documents verified.' })
  @IsOptional()
  @IsString()
  note?: string;
}
