import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../../modules/permissions';
import { REQUIRED_PERMISSIONS_KEY } from './rbac.constants';

// Este decorator apenas declara permissoes exigidas; o guard futuro fara a validacao de acesso.
export function RequirePermissions(...permissions: PermissionCode[]) {
  return SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
}
