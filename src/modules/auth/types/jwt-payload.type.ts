import { UserRole } from '../../users';

export interface AuthenticatedTenantContext {
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
}

export interface AuthenticatedUserPayload extends AuthenticatedTenantContext {
  sub: string;
  role: UserRole;
}

export interface AuthMeResponse {
  user: AuthenticatedUserPayload;
  tenant: AuthenticatedTenantContext;
}

export type JwtPayload = AuthenticatedUserPayload;
export type CurrentUserPayload = AuthenticatedUserPayload;
