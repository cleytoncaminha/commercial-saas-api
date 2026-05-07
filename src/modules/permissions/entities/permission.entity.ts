import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common';
import { PermissionCode } from '../permissions.constants';

@Entity({ name: 'permissions', schema: 'public' })
export class PermissionEntity extends BaseEntity {
  @ApiProperty({ enum: PermissionCode, example: PermissionCode.ADMIN_ALL })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  code!: PermissionCode;

  @ApiProperty({ example: 'Full admin access' })
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @ApiPropertyOptional({ example: 'Allows all permission checks.' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'admin' })
  @Column({ type: 'varchar', length: 80 })
  module!: string;
}
