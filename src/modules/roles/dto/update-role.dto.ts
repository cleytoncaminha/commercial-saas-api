import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PermissionCode } from '../../permissions/permissions.constants';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Manager' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'Can manage daily store operations.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: PermissionCode,
    isArray: true,
    example: [PermissionCode.USERS_READ, PermissionCode.CUSTOMERS_READ],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PermissionCode, { each: true })
  permissionCodes?: PermissionCode[];
}
