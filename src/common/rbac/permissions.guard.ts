import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../../modules/auth/types/authenticated-request.type';
import { PermissionCode } from '../../modules/permissions/permissions.constants';
import { TenantMembershipsService } from '../../modules/tenant-memberships/tenant-memberships.service';
import { REQUIRED_PERMISSIONS_KEY } from './rbac.constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantMembershipsService: TenantMembershipsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<PermissionCode[]>(
        REQUIRED_PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (user === undefined || user.membershipId === undefined) {
      throw new ForbiddenException('Authenticated membership is required');
    }

    const { tenantId, membershipId } = user;

    const currentPermissionCodes =
      await this.tenantMembershipsService.getPermissionCodesForMembership(
        tenantId,
        membershipId,
      );

    if (currentPermissionCodes.includes(PermissionCode.ADMIN_ALL)) {
      return true;
    }

    const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
      currentPermissionCodes.includes(permission),
    );

    if (!hasAllRequiredPermissions) {
      throw new ForbiddenException('Missing required permissions');
    }

    return true;
  }
}
