import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from '../../common/rbac/permissions.guard';
import { RoleEntity } from '../roles/entities/role.entity';
import { TenantMembershipEntity } from './entities/tenant-membership.entity';
import { TenantMembershipsController } from './tenant-memberships.controller';
import { TenantMembershipsService } from './tenant-memberships.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantMembershipEntity, RoleEntity])],
  controllers: [TenantMembershipsController],
  providers: [TenantMembershipsService, PermissionsGuard],
  exports: [TenantMembershipsService],
})
export class TenantMembershipsModule {}
