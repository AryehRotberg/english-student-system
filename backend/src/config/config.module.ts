import { Global, Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer';
import { PostgresService } from './postgres.client';

@Global()
@Module({
    providers: [PostgresService, NodemailerService],
    exports: [PostgresService, NodemailerService],
})
export class ConfigModule {}
