import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService, HealthStatus } from './app.service';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns the API health status.',
    schema: {
      example: {
        status: 'ok',
        service: 'commercial-saas-api',
      },
    },
  })
  getHealth(): HealthStatus {
    return this.appService.getHealth();
  }
}
