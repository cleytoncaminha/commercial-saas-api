import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common';
import { PermissionEntity } from '../../permissions/entities/permission.entity';
import { TenantEntity } from '../../tenants/entities/tenant.entity';

@Entity({ name: 'roles', schema: 'public' })
@Index('UQ_roles_tenant_code', ['tenantId', 'code'], { unique: true })
export class RoleEntity extends BaseEntity {
  @ApiProperty({ example: '5a3a41f0-3b0b-4b6d-8d0f-277aaf4d9d7f' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @ApiProperty({ example: 'Manager' })
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @ApiProperty({ example: 'manager' })
  @Column({ type: 'varchar', length: 80 })
  code!: string;

  @ApiPropertyOptional({ example: 'Can manage daily store operations.' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @ApiProperty({ example: false })
  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({ type: () => PermissionEntity, isArray: true })
  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'role_permissions',
    schema: 'public',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions!: PermissionEntity[];
}
