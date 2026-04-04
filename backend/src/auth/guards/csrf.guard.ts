import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class CsrfGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>();
        if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
            if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
                throw new ForbiddenException('CSRF check failed');
            }
        }
        return true;
    }
}
