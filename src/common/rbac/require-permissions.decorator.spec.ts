import { Reflector } from '@nestjs/core';
import { PermissionCode } from '../../modules/permissions/permissions.constants';
import { REQUIRED_PERMISSIONS_KEY } from './rbac.constants';
import { RequirePermissions } from './require-permissions.decorator';

describe('RequirePermissions', () => {
  it('stores required permissions as route metadata', () => {
    class TestController {
      @RequirePermissions(
        PermissionCode.PERMISSIONS_READ,
        PermissionCode.ROLES_READ,
      )
      handler(): void {
        return undefined;
      }
    }

    const reflector = new Reflector();
    const handler = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      'handler',
    )?.value as () => void;
    const permissions = reflector.get<PermissionCode[]>(
      REQUIRED_PERMISSIONS_KEY,
      handler,
    );

    expect(permissions).toEqual([
      PermissionCode.PERMISSIONS_READ,
      PermissionCode.ROLES_READ,
    ]);
  });
});
