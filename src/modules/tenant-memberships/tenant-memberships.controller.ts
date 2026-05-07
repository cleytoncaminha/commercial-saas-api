/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentTenant, JwtAuthGuard } from '../auth';
import { AuthenticatedTenantContext } from '../auth/types/jwt-payload.type';
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
  @UseGuards(JwtAuthGuard)
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
    return this.tenantMembershipsService.assignRolesToMembership(
      tenant.tenantId,
      membershipId,
      assignMembershipRolesDto.roleIds,
    );
  }
}
