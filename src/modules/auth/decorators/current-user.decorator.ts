import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.type';
import { AuthenticatedUserPayload } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator<
  undefined,
  AuthenticatedUserPayload
>((_data: undefined, context: ExecutionContext): AuthenticatedUserPayload => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

  if (request.user === undefined) {
    throw new UnauthorizedException('Authenticated user not found');
  }

  return request.user;
});
