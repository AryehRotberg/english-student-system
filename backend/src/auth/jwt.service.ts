import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserResponseDto } from '../modules/users/dto/user-response.dto';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class JwtService {
    private readonly jwtSecret: string;
    private readonly jwtExpiration: number;

    constructor() {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        this.jwtSecret = process.env.JWT_SECRET;
        this.jwtExpiration = 7 * 24 * 60 * 60; // 7 days in seconds
    }

    getJwtExpiration(): number {
        return this.jwtExpiration;
    }

    getJwtExpirationMs(): number {
        return this.jwtExpiration * 1000;
    }

    generateToken(user: User): string {
        const userDto = UserResponseDto.fromEntity(user);

        return jwt.sign(
            {
                ...userDto,
                sub: userDto.id,
            },
            this.jwtSecret,
            { expiresIn: this.jwtExpiration },
        );
    }

    verifyToken(token: string): jwt.JwtPayload {
        return jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
    }
}
