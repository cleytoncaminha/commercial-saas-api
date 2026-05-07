import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TenantEntity } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List tenants' })
  @ApiOkResponse({ type: TenantEntity, isArray: true })
  findAll(): Promise<TenantEntity[]> {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TenantEntity })
  findOne(@Param('id') id: string): Promise<TenantEntity> {
    return this.tenantsService.findOne(id);
  }
}
