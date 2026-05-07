import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('tenants/:tenantId/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a tenant-scoped role',
    description:
      'Temporary route shape until protected routes use CurrentTenant.',
  })
  @ApiParam({ name: 'tenantId', format: 'uuid' })
  @ApiCreatedResponse({ type: RoleEntity })
  createForTenant(
    @Param('tenantId') tenantId: string,
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<RoleEntity> {
    return this.rolesService.createForTenant(tenantId, createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'List roles for a tenant' })
  @ApiParam({ name: 'tenantId', format: 'uuid' })
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  findAllByTenant(@Param('tenantId') tenantId: string): Promise<RoleEntity[]> {
    return this.rolesService.findAllByTenant(tenantId);
  }

  @Get(':roleId')
  @ApiOperation({ summary: 'Get one role for a tenant' })
  @ApiParam({ name: 'tenantId', format: 'uuid' })
  @ApiParam({ name: 'roleId', format: 'uuid' })
  @ApiOkResponse({ type: RoleEntity })
  findOneByTenant(
    @Param('tenantId') tenantId: string,
    @Param('roleId') roleId: string,
  ): Promise<RoleEntity> {
    return this.rolesService.findOneByTenant(tenantId, roleId);
  }

  @Patch(':roleId')
  @ApiOperation({ summary: 'Update a tenant-scoped role' })
  @ApiParam({ name: 'tenantId', format: 'uuid' })
  @ApiParam({ name: 'roleId', format: 'uuid' })
  @ApiOkResponse({ type: RoleEntity })
  updateForTenant(
    @Param('tenantId') tenantId: string,
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    return this.rolesService.updateForTenant(tenantId, roleId, updateRoleDto);
  }
}
