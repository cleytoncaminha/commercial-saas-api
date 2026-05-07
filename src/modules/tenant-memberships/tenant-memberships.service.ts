import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionCode } from '../permissions';
import { RoleEntity } from '../roles/entities/role.entity';
import { TenantMembershipEntity } from './entities/tenant-membership.entity';

@Injectable()
export class TenantMembershipsService {
  constructor(
    @InjectRepository(TenantMembershipEntity)
    private readonly membershipsRepository: Repository<TenantMembershipEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
  ) {}

  async assignRolesToMembership(
    tenantId: string,
    membershipId: string,
    roleIds: string[],
  ): Promise<TenantMembershipEntity> {
    const membership = await this.getMembershipWithRolesAndPermissions(
      tenantId,
      membershipId,
    );

    if (roleIds.length === 0) {
      membership.roles = [];
      return this.membershipsRepository.save(membership);
    }

    const roles = await this.rolesRepository.find({
      where: {
        id: In(roleIds),
        tenantId,
      },
      relations: {
        permissions: true,
      },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException(
        'All roles must exist and belong to the current tenant',
      );
    }

    membership.roles = roles;

    return this.membershipsRepository.save(membership);
  }

  async getMembershipWithRolesAndPermissions(
    tenantId: string,
    membershipId: string,
  ): Promise<TenantMembershipEntity> {
    const membership = await this.membershipsRepository.findOne({
      where: {
        id: membershipId,
        tenantId,
      },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });

    if (membership === null) {
      throw new NotFoundException('Tenant membership not found');
    }

    return membership;
  }

  async getPermissionCodesForMembership(
    tenantId: string,
    membershipId: string,
  ): Promise<PermissionCode[]> {
    const membership = await this.getMembershipWithRolesAndPermissions(
      tenantId,
      membershipId,
    );
    const permissionCodes = membership.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.code),
    );

    return [...new Set(permissionCodes)];
  }
}
