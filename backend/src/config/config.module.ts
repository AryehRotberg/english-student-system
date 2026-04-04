import { Global, Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer';
import { PostgresService } from './postgres.client';
import { RedisService } from './redis.client';
import { SupabaseService } from './supabase.client';

@Global()
@Module({
    providers: [
        PostgresService,
        NodemailerService,
        RedisService,
        SupabaseService,
    ],
    exports: [
        PostgresService,
        NodemailerService,
        RedisService,
        SupabaseService,
    ],
})
export class ConfigModule {}
