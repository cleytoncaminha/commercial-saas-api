import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from '../../common/rbac/permissions.guard';
import { PermissionEntity } from '../permissions/entities/permission.entity';
import { PermissionsModule } from '../permissions/permissions.module';
import { TenantMembershipsModule } from '../tenant-memberships/tenant-memberships.module';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { RoleEntity } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, TenantEntity, PermissionEntity]),
    PermissionsModule,
    TenantMembershipsModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, PermissionsGuard],
  exports: [RolesService],
})
export class RolesModule {}
