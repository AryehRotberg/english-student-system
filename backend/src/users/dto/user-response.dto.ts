import { User } from '../entities/user.entity';

export class UserResponseDto {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly role: string;
    readonly createdAt: Date;

    private constructor(props: UserResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(user: User): UserResponseDto {
        return new UserResponseDto({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });
    }

    static fromEntities(users: User[]): UserResponseDto[] {
        return users.map(UserResponseDto.fromEntity);
    }
}