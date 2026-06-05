import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
    let service: JwtService;

    beforeEach(async () => {
        process.env.JWT_SECRET = 'test-secret';

        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtService],
        }).compile();

        service = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        delete process.env.JWT_SECRET;
    });

    describe('constructor', () => {
        it('should throw if JWT_SECRET is not defined', () => {
            delete process.env.JWT_SECRET;
            expect(() => new JwtService()).toThrow('JWT_SECRET is not defined');
        });
    });

    describe('getJwtExpiration', () => {
        it('should return 7 days in seconds', () => {
            expect(service.getJwtExpiration()).toBe(7 * 24 * 60 * 60);
        });
    });

    describe('getJwtExpirationMs', () => {
        it('should return 7 days in milliseconds', () => {
            expect(service.getJwtExpirationMs()).toBe(7 * 24 * 60 * 60 * 1000);
        });
    });

    describe('generateToken', () => {
        it('should generate a valid JWT containing user fields', () => {
            const mockUser = {
                id: 'user-uuid-1',
                name: 'Alice',
                email: 'alice@example.com',
                role: 'student',
                isApproved: true,
                teacherId: null,
                get teacherName() {
                    return null;
                },
                get teacherEmail() {
                    return null;
                },
                createdAt: new Date('2024-01-01'),
            } as any;

            const token = service.generateToken(mockUser);

            expect(typeof token).toBe('string');
            const decoded = jwt.verify(token, 'test-secret') as jwt.JwtPayload;
            expect(decoded.sub).toBe('user-uuid-1');
            expect(decoded.email).toBe('alice@example.com');
        });
    });

    describe('verifyToken', () => {
        it('should decode and return the payload for a valid token', () => {
            const payload = {
                sub: 'user-uuid-1',
                email: 'alice@example.com',
            };
            const token = jwt.sign(payload, 'test-secret', {
                expiresIn: 3600,
            });

            const result = service.verifyToken(token);

            expect(result.sub).toBe('user-uuid-1');
            expect(result.email).toBe('alice@example.com');
        });

        it('should throw when the token is invalid', () => {
            expect(() => service.verifyToken('invalid-token')).toThrow();
        });

        it('should throw when the token is signed with a different secret', () => {
            const token = jwt.sign({ sub: 'x' }, 'wrong-secret', {
                expiresIn: 3600,
            });
            expect(() => service.verifyToken(token)).toThrow();
        });
    });
});
