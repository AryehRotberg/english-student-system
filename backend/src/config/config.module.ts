import { Global, Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer';
import { PostgresService } from './postgres.client';
import { RedisService } from './redis.client';

@Global()
@Module({
    providers: [PostgresService, NodemailerService, RedisService],
    exports: [PostgresService, NodemailerService, RedisService],
})
export class ConfigModule {}
