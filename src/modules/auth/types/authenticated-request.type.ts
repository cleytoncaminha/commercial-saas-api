import { AuthenticatedUserPayload } from './jwt-payload.type';

export interface AuthenticatedRequest {
  user?: AuthenticatedUserPayload;
}
