import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PermissionCode } from '../../permissions';

export class CreateRoleDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'manager' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(80)
  code!: string;

  @ApiPropertyOptional({ example: 'Can manage daily store operations.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    enum: PermissionCode,
    isArray: true,
    example: [PermissionCode.USERS_READ, PermissionCode.CUSTOMERS_READ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionCode, { each: true })
  permissionCodes!: PermissionCode[];
}
