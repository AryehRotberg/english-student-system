import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import Sentry from './sentry';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error(
                'Supabase URL and Key must be set in environment variables',
            );
        }

        this.supabase = new SupabaseClient(supabaseUrl, supabaseKey);
    }

    async uploadToBucket(
        buffer: Buffer,
        bucket: string,
        path: string,
    ): Promise<any> {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(path, buffer, {
                contentType: 'audio/mpeg',
                upsert: true,
            });
        if (error) {
            console.error('Supabase upload error:', error);
            Sentry.captureException(error);
            throw new BadRequestException(
                'Failed to upload audio to storage. Please check the bucket name and path.',
            );
        }

        return data;
    }

    async loadFromBucket(bucket: string, path: string): Promise<Buffer> {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .download(path);
        if (error) {
            console.error('Supabase download error:', error);
            Sentry.captureException(error);
            throw new BadRequestException(
                'Failed to download audio from storage. Please check the bucket name and path.',
            );
        }

        return Buffer.from(await data.arrayBuffer());
    }
}
