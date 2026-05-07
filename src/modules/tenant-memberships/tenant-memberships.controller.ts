import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../../common/rbac/permissions.guard';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedTenantContext } from '../auth/types/jwt-payload.type';
import { PermissionCode } from '../permissions/permissions.constants';
import { AssignMembershipRolesDto } from './dto/assign-membership-roles.dto';
import { TenantMembershipEntity } from './entities/tenant-membership.entity';
import { TenantMembershipsService } from './tenant-memberships.service';

@ApiTags('tenant-memberships')
@Controller('tenant-memberships')
export class TenantMembershipsController {
  constructor(
    private readonly tenantMembershipsService: TenantMembershipsService,
  ) {}

  @Post(':membershipId/roles')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PermissionCode.ROLES_ASSIGN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Assign tenant-scoped roles to a membership',
    description: 'This route should later require roles.assign permission.',
  })
  @ApiParam({ name: 'membershipId', format: 'uuid' })
  @ApiOkResponse({ type: TenantMembershipEntity })
  assignRolesToMembership(
    @CurrentTenant() tenant: AuthenticatedTenantContext,
    @Param('membershipId') membershipId: string,
    @Body() assignMembershipRolesDto: AssignMembershipRolesDto,
  ): Promise<TenantMembershipEntity> {
    // CurrentTenant garante que a atribuicao de roles use o tenant do JWT, nao dados manipulaveis da requisicao.
    return this.tenantMembershipsService.assignRolesToMembership(
      tenant.tenantId,
      membershipId,
      assignMembershipRolesDto.roleIds,
    );
  }
}
