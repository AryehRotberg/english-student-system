import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { HashingService } from './hashing.service';

jest.mock('argon2');

describe('HashingService', () => {
    let service: HashingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HashingService],
        }).compile();

        service = module.get<HashingService>(HashingService);
        jest.clearAllMocks();
    });

    describe('hash', () => {
        it('should hash a string using argon2id', async () => {
            (argon2.hash as jest.Mock).mockResolvedValue('hashed_value');

            const result = await service.hash('my-password');

            expect(argon2.hash).toHaveBeenCalledWith(
                'my-password',
                expect.objectContaining({ type: argon2.argon2id }),
            );
            expect(result).toBe('hashed_value');
        });
    });

    describe('compare', () => {
        it('should return true when password matches hash', async () => {
            (argon2.verify as jest.Mock).mockResolvedValue(true);

            const result = await service.compare('my-password', 'hashed_value');

            expect(argon2.verify).toHaveBeenCalledWith(
                'hashed_value',
                'my-password',
            );
            expect(result).toBe(true);
        });

        it('should return false when password does not match hash', async () => {
            (argon2.verify as jest.Mock).mockResolvedValue(false);

            const result = await service.compare(
                'wrong-password',
                'hashed_value',
            );

            expect(result).toBe(false);
        });
    });
});
