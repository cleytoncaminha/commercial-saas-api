import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserPayload } from '../types/jwt-payload.type';

interface AuthenticatedRequest {
  user?: CurrentUserPayload;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user as CurrentUserPayload;
  },
);
