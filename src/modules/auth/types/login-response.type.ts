import { UserRole } from '../../users';

export interface LoginUserResponse {
  id: string;
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: LoginUserResponse;
}
