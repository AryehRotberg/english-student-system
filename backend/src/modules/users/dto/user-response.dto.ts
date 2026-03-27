import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly name: string;
    @ApiProperty()
    readonly email: string;
    @ApiProperty()
    readonly role: string;
    @ApiProperty()
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