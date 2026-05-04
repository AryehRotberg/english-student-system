import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Get('/health')
    async healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'development',
        };
    }
}
