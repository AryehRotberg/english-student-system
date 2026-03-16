import { Global, Module } from '@nestjs/common';
import { PostgresService } from './postgres.client';

@Global()
@Module({
    providers: [PostgresService],
    exports: [PostgresService],
})
export class ConfigModule {}
