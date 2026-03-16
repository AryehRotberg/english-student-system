import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    constructor() { }

    async healthCheck() {
        return {
            'status': 'ok',
            'timestamp': new Date().toISOString(),
            'env': process.env.NODE_ENV || 'development'
        }
    }
}