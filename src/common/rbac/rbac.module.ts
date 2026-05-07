import { Module } from '@nestjs/common';
import { TenantMembershipsModule } from '../../modules/tenant-memberships/tenant-memberships.module';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [TenantMembershipsModule],
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class RbacModule {}
