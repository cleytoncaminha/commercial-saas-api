import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../../common/rbac/permissions.guard';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionCode } from './permissions.constants';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PermissionCode.PERMISSIONS_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the global permissions catalog' })
  @ApiOkResponse({ type: PermissionEntity, isArray: true })
  findAll(): Promise<PermissionEntity[]> {
    return this.permissionsService.findAll();
  }
}
