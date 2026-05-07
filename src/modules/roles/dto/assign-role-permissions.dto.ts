import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsEnum } from 'class-validator';
import { PermissionCode } from '../../permissions/permissions.constants';

export class AssignRolePermissionsDto {
  @ApiProperty({
    enum: PermissionCode,
    isArray: true,
    example: [PermissionCode.USERS_READ, PermissionCode.CUSTOMERS_READ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(PermissionCode, { each: true })
  permissionCodes!: PermissionCode[];
}
