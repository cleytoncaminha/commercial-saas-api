import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List the global permissions catalog' })
  @ApiOkResponse({ type: PermissionEntity, isArray: true })
  findAll(): Promise<PermissionEntity[]> {
    return this.permissionsService.findAll();
  }
}
