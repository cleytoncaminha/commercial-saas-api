import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../../common/rbac/permissions.guard';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedTenantContext } from '../auth/types/jwt-payload.type';
import { PermissionCode } from '../permissions/permissions.constants';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions(PermissionCode.ROLES_CREATE)
  @ApiOperation({
    summary: 'Create a tenant-scoped role',
  })
  @ApiCreatedResponse({ type: RoleEntity })
  createForTenant(
    @CurrentTenant() tenant: AuthenticatedTenantContext,
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<RoleEntity> {
    // CurrentTenant impede que um token de um tenant crie roles em outro tenant.
    return this.rolesService.createForTenant(tenant.tenantId, createRoleDto);
  }

  @Get()
  @RequirePermissions(PermissionCode.ROLES_READ)
  @ApiOperation({ summary: 'List roles for a tenant' })
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  findAllByTenant(
    @CurrentTenant() tenant: AuthenticatedTenantContext,
  ): Promise<RoleEntity[]> {
    return this.rolesService.findAllByTenant(tenant.tenantId);
  }

  @Get(':roleId')
  @RequirePermissions(PermissionCode.ROLES_READ)
  @ApiOperation({ summary: 'Get one role for a tenant' })
  @ApiParam({ name: 'roleId', format: 'uuid' })
  @ApiOkResponse({ type: RoleEntity })
  findOneByTenant(
    @CurrentTenant() tenant: AuthenticatedTenantContext,
    @Param('roleId') roleId: string,
  ): Promise<RoleEntity> {
    return this.rolesService.findOneByTenant(tenant.tenantId, roleId);
  }

  @Patch(':roleId')
  @RequirePermissions(PermissionCode.ROLES_UPDATE)
  @ApiOperation({ summary: 'Update a tenant-scoped role' })
  @ApiParam({ name: 'roleId', format: 'uuid' })
  @ApiOkResponse({ type: RoleEntity })
  updateForTenant(
    @CurrentTenant() tenant: AuthenticatedTenantContext,
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    return this.rolesService.updateForTenant(
      tenant.tenantId,
      roleId,
      updateRoleDto,
    );
  }

  @Post(':roleId/permissions')
  @RequirePermissions(PermissionCode.ROLES_UPDATE)
  @ApiOperation({ summary: 'Assign permissions to a tenant-scoped role' })
  @ApiParam({ name: 'roleId', format: 'uuid' })
  @ApiOkResponse({ type: RoleEntity })
  assignPermissions(
    @CurrentTenant() tenant: AuthenticatedTenantContext,
    @Param('roleId') roleId: string,
    @Body() assignRolePermissionsDto: AssignRolePermissionsDto,
  ): Promise<RoleEntity> {
    return this.rolesService.assignPermissions(
      tenant.tenantId,
      roleId,
      assignRolePermissionsDto.permissionCodes,
    );
  }

  @Post(':roleId/deactivate')
  @RequirePermissions(PermissionCode.ROLES_DELETE)
  @ApiOperation({ summary: 'Deactivate a tenant-scoped role' })
  @ApiParam({ name: 'roleId', format: 'uuid' })
  @ApiOkResponse({ type: RoleEntity })
  deactivateForTenant(
    @CurrentTenant() tenant: AuthenticatedTenantContext,
    @Param('roleId') roleId: string,
  ): Promise<RoleEntity> {
    return this.rolesService.deactivateForTenant(tenant.tenantId, roleId);
  }
}
