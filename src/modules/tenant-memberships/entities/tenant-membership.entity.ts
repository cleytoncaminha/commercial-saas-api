import { ApiProperty } from '@nestjs/swagger';
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
import { RoleEntity } from '../../roles/entities/role.entity';
import { TenantEntity } from '../../tenants/entities/tenant.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'tenant_memberships', schema: 'public' })
@Index('UQ_tenant_memberships_tenant_user', ['tenantId', 'userId'], {
  unique: true,
})
export class TenantMembershipEntity extends BaseEntity {
  @ApiProperty({ example: '5a3a41f0-3b0b-4b6d-8d0f-277aaf4d9d7f' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @ApiProperty({ example: '8f9f5b24-3ed3-4f94-97f9-08a45f4c01af' })
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({ type: () => RoleEntity, isArray: true })
  @ManyToMany(() => RoleEntity)
  @JoinTable({
    name: 'membership_roles',
    schema: 'public',
    joinColumn: {
      name: 'membership_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles!: RoleEntity[];
}
