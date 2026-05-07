import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TenantHostResolver } from '../../common';
import { CurrentTenant } from './decorators/current-tenant.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import type {
  AuthenticatedTenantContext,
  AuthenticatedUserPayload,
  AuthMeResponse,
} from './types/jwt-payload.type';
import type { LoginResponse } from './types/login-response.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantHostResolver: TenantHostResolver,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login using tenant subdomain and credentials' })
  @ApiHeader({
    name: 'Host',
    example: 'mercado-lima.localhost:3000',
    required: true,
  })
  @ApiOkResponse({ description: 'Access token and safe user data.' })
  login(
    @Headers('host') host: string | undefined,
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponse> {
    const tenantContext = this.tenantHostResolver.resolveTenantContext(host);

    if (tenantContext === null) {
      throw new UnauthorizedException('Invalid tenant host');
    }

    return this.authService.login(tenantContext.tenantSlug, loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated JWT context' })
  @ApiOkResponse({ description: 'Current user and tenant context from JWT.' })
  me(
    @CurrentUser() currentUser: AuthenticatedUserPayload,
    @CurrentTenant() tenant: AuthenticatedTenantContext,
  ): AuthMeResponse {
    return {
      user: currentUser,
      tenant,
    };
  }
}
