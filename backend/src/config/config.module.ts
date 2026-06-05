import { Global, Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer';
import { RedisService } from './redis.client';
import { SupabaseService } from './supabase.client';

@Global()
@Module({
    providers: [NodemailerService, RedisService, SupabaseService],
    exports: [NodemailerService, RedisService, SupabaseService],
})
export class ConfigModule {}
