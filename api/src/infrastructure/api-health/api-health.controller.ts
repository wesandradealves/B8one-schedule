import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class ApiHealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
