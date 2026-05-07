import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common';
import { TenantEntity } from '../../tenants/entities/tenant.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity({ name: 'users', schema: 'public' })
@Index('UQ_users_tenant_email', ['tenantId', 'email'], { unique: true })
export class UserEntity extends BaseEntity {
  @ApiProperty({ example: '5a3a41f0-3b0b-4b6d-8d0f-277aaf4d9d7f' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @ApiProperty({ example: 'Ana Lima' })
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @ApiProperty({ example: 'ana@mercadolima.com' })
  @Column({ type: 'varchar', length: 160 })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MEMBER })
  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.MEMBER,
  })
  role!: UserRole;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
