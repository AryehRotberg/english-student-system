import type { UserResponseDto } from '../../users/dto/user-response.dto';

declare global {
    namespace Express {
        interface Request {
            user?: UserResponseDto;
        }
    }
}
