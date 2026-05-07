import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from '../../common/rbac/permissions.guard';
import { TenantMembershipsModule } from '../tenant-memberships/tenant-memberships.module';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionEntity]),
    TenantMembershipsModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsGuard],
  exports: [PermissionsService],
})
export class PermissionsModule {}
