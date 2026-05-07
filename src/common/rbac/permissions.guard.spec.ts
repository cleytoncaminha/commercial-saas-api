import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUserPayload } from '../../modules/auth/types/jwt-payload.type';
import { PermissionCode } from '../../modules/permissions/permissions.constants';
import { TenantMembershipsService } from '../../modules/tenant-memberships/tenant-memberships.service';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const user: AuthenticatedUserPayload = {
    sub: 'user-id',
    tenantId: 'tenant-id',
    tenantSlug: 'tenant-slug',
    schemaName: 'tenant_tenant_slug',
    membershipId: 'membership-id',
    membershipRole: 'member',
  };

  let requiredPermissions: PermissionCode[] | undefined;
  let getPermissionCodesForMembership: jest.MockedFunction<
    TenantMembershipsService['getPermissionCodesForMembership']
  >;
  let guard: PermissionsGuard;

  beforeEach(() => {
    requiredPermissions = undefined;
    getPermissionCodesForMembership = jest.fn();

    const reflector = {
      getAllAndOverride: <T>() => requiredPermissions as T | undefined,
    } as Reflector;

    const tenantMembershipsService = {
      getPermissionCodesForMembership,
    } as Pick<TenantMembershipsService, 'getPermissionCodesForMembership'>;

    guard = new PermissionsGuard(
      reflector,
      tenantMembershipsService as TenantMembershipsService,
    );
  });

  it('allows route with no required permissions', async () => {
    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(getPermissionCodesForMembership).not.toHaveBeenCalled();
  });

  it('allows user with admin.all', async () => {
    requiredPermissions = [PermissionCode.PERMISSIONS_READ];
    // Mockamos as permissoes do banco para testar apenas a decisao do guard.
    getPermissionCodesForMembership.mockResolvedValue([
      PermissionCode.ADMIN_ALL,
    ]);

    await expect(guard.canActivate(createContext(user))).resolves.toBe(true);
  });

  it('allows user with required permission', async () => {
    requiredPermissions = [PermissionCode.PERMISSIONS_READ];
    getPermissionCodesForMembership.mockResolvedValue([
      PermissionCode.PERMISSIONS_READ,
    ]);

    await expect(guard.canActivate(createContext(user))).resolves.toBe(true);
  });

  it('denies user without required permission', async () => {
    requiredPermissions = [PermissionCode.PERMISSIONS_READ];
    getPermissionCodesForMembership.mockResolvedValue([
      PermissionCode.DASHBOARD_READ,
    ]);

    await expect(guard.canActivate(createContext(user))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});

function createContext(user?: AuthenticatedUserPayload): ExecutionContext {
  class TestController {}

  const request = {
    user,
  };

  return {
    getClass: () => TestController,
    getHandler: () => TestController,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}
