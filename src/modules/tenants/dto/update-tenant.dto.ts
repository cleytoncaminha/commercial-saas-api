import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional({
    example: 'Mercado Lima',
    description: 'Company or customer display name.',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the tenant can be used by the application.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
