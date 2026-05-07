export interface LoginUserResponse {
  id: string;
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  membershipId: string;
  membershipRole: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: LoginUserResponse;
}
