import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashingService {
    private readonly argonOptions = {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
    };

    async hash(data: string): Promise<string> {
        return await argon2.hash(data, this.argonOptions);
    }

    async compare(data: string, hash: string): Promise<boolean> {
        return await argon2.verify(hash, data);
    }
}
