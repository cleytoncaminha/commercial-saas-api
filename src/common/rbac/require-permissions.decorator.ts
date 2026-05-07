import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../../modules/permissions/permissions.constants';
import { REQUIRED_PERMISSIONS_KEY } from './rbac.constants';

// Este decorator apenas declara permissoes exigidas; o PermissionsGuard faz a validacao.
export function RequirePermissions(...permissions: PermissionCode[]) {
  return SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
}
