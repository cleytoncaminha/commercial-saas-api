import { UserRole } from '../../users';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  role: UserRole;
}

export type CurrentUserPayload = JwtPayload;
