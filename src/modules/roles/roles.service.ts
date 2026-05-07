import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PermissionCode,
  PermissionEntity,
  PermissionsService,
} from '../permissions';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantsRepository: Repository<TenantEntity>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async createForTenant(
    tenantId: string,
    createRoleDto: CreateRoleDto,
  ): Promise<RoleEntity> {
    await this.ensureTenantExists(tenantId);
    await this.ensureCodeIsAvailable(tenantId, createRoleDto.code);

    const permissions = await this.getPermissionsOrFail(
      createRoleDto.permissionCodes,
    );

    const role = this.rolesRepository.create({
      tenantId,
      name: createRoleDto.name,
      code: createRoleDto.code,
      description: createRoleDto.description ?? null,
      permissions,
    });

    return this.rolesRepository.save(role);
  }

  findAllByTenant(tenantId: string): Promise<RoleEntity[]> {
    return this.rolesRepository.find({
      where: {
        tenantId,
      },
      relations: {
        permissions: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneByTenant(tenantId: string, roleId: string): Promise<RoleEntity> {
    const role = await this.rolesRepository.findOne({
      where: {
        id: roleId,
        tenantId,
      },
      relations: {
        permissions: true,
      },
    });

    if (role === null) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async updateForTenant(
    tenantId: string,
    roleId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    const role = await this.findOneByTenant(tenantId, roleId);

    if (updateRoleDto.name !== undefined) {
      role.name = updateRoleDto.name;
    }

    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description;
    }

    if (updateRoleDto.isActive !== undefined) {
      role.isActive = updateRoleDto.isActive;
    }

    if (updateRoleDto.permissionCodes !== undefined) {
      role.permissions = await this.getPermissionsOrFail(
        updateRoleDto.permissionCodes,
      );
    }

    return this.rolesRepository.save(role);
  }

  async assignPermissions(
    tenantId: string,
    roleId: string,
    permissionCodes: PermissionCode[],
  ): Promise<RoleEntity> {
    const role = await this.findOneByTenant(tenantId, roleId);
    role.permissions = await this.getPermissionsOrFail(permissionCodes);

    return this.rolesRepository.save(role);
  }

  async createDefaultRolesForTenant(tenantId: string): Promise<RoleEntity[]> {
    await this.ensureTenantExists(tenantId);

    const defaultRoles = [
      {
        name: 'Owner',
        code: 'owner',
        description: 'Full tenant administration.',
        isSystem: true,
        permissionCodes: [PermissionCode.ADMIN_ALL],
      },
      {
        name: 'Member',
        code: 'member',
        description: 'Basic tenant access.',
        isSystem: true,
        permissionCodes: [PermissionCode.DASHBOARD_READ],
      },
    ];

    const roles: RoleEntity[] = [];

    for (const defaultRole of defaultRoles) {
      const existingRole = await this.rolesRepository.findOne({
        where: {
          tenantId,
          code: defaultRole.code,
        },
        relations: {
          permissions: true,
        },
      });

      if (existingRole !== null) {
        roles.push(existingRole);
        continue;
      }

      const permissions = await this.getPermissionsOrFail(
        defaultRole.permissionCodes,
      );
      const role = this.rolesRepository.create({
        tenantId,
        name: defaultRole.name,
        code: defaultRole.code,
        description: defaultRole.description,
        isSystem: defaultRole.isSystem,
        permissions,
      });

      roles.push(await this.rolesRepository.save(role));
    }

    return roles;
  }

  private async ensureTenantExists(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({
      where: {
        id: tenantId,
      },
      select: {
        id: true,
      },
    });

    if (tenant === null) {
      throw new NotFoundException('Tenant not found');
    }
  }

  private async ensureCodeIsAvailable(
    tenantId: string,
    code: string,
  ): Promise<void> {
    const existingRole = await this.rolesRepository.findOne({
      where: {
        tenantId,
        code,
      },
      select: {
        id: true,
      },
    });

    if (existingRole !== null) {
      throw new ConflictException('Role code already exists for this tenant');
    }
  }

  private async getPermissionsOrFail(
    permissionCodes: PermissionCode[],
  ): Promise<PermissionEntity[]> {
    const uniquePermissionCodes = [...new Set(permissionCodes)];

    if (uniquePermissionCodes.length === 0) {
      throw new BadRequestException('At least one permission is required');
    }

    const permissions = await this.permissionsService.findByCodes(
      uniquePermissionCodes,
    );

    if (permissions.length !== uniquePermissionCodes.length) {
      throw new BadRequestException('One or more permissions do not exist');
    }

    return permissions;
  }
}
