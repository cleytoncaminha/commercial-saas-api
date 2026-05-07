import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.type';
import {
  AuthenticatedTenantContext,
  AuthenticatedUserPayload,
} from '../types/jwt-payload.type';

export const CurrentTenant = createParamDecorator<
  undefined,
  AuthenticatedTenantContext
>((_data: undefined, context: ExecutionContext): AuthenticatedTenantContext => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

  if (request.user === undefined) {
    throw new UnauthorizedException('Authenticated user not found');
  }

  const user: AuthenticatedUserPayload = request.user;

  return {
    tenantId: user.tenantId,
    tenantSlug: user.tenantSlug,
    schemaName: user.schemaName,
  };
});
