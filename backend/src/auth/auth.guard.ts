import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import Sentry from '../config/sentry';
import { UserResponseDto } from '../modules/users/dto/user-response.dto';
import { UsersService } from '../modules/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        protected readonly usersService: UsersService,
        protected readonly jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const user = await this.authenticateUser(request);

        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }

        request.user = user;
        return true;
    }

    protected async authenticateUser(
        req: Request,
    ): Promise<UserResponseDto | null> {
        const accessToken = req.cookies?.access_token;

        if (!accessToken) {
            return null;
        }

        try {
            const decoded = this.jwtService.verifyToken(accessToken);

            if (!decoded) {
                throw new UnauthorizedException('Invalid token');
            }

            const user = await this.usersService.findOneByEmail(decoded.email);
            if (!user) {
                return null;
            }

            return UserResponseDto.fromEntity(user);
        } catch (error) {
            Sentry.captureException(error);
            console.error('Error verifying token:', error);
            return null;
        }
    }
}

@Injectable()
export class TeacherGuard extends AuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as UserResponseDto;

        const userRole = user.role;

        if (userRole !== 'teacher') {
            throw new UnauthorizedException('Teacher access required');
        }

        return true;
    }
}
