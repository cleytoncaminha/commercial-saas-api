import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity, PermissionsModule } from '../permissions';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { RoleEntity } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, TenantEntity, PermissionEntity]),
    PermissionsModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
