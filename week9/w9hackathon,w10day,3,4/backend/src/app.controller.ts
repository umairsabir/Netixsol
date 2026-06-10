import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'Smart Healthcare Store API',
      timestamp: new Date().toISOString(),
    };
  }
}
