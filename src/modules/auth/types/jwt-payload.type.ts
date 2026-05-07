export interface AuthenticatedTenantContext {
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
}

export interface AuthenticatedUserPayload extends AuthenticatedTenantContext {
  sub: string;
  membershipId?: string;
  membershipRole?: string;
  role?: string;
}

export interface AuthMeResponse {
  user: AuthenticatedUserPayload;
  tenant: AuthenticatedTenantContext;
}

export type JwtPayload = AuthenticatedUserPayload;
export type CurrentUserPayload = AuthenticatedUserPayload;
