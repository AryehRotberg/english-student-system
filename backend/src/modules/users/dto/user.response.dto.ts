import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

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
    readonly teacherId?: string | null;
    @ApiProperty()
    readonly teacherName?: string | null;
    @ApiProperty()
    readonly teacherEmail?: string | null;
    @ApiProperty()
    readonly isApproved: boolean;
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
            teacherId: user.teacherId,
            teacherName: user.teacherName,
            teacherEmail: user.teacherEmail,
            isApproved: user.isApproved,
            createdAt: user.createdAt,
        });
    }

    static fromEntities(users: User[]): UserResponseDto[] {
        return users.map(UserResponseDto.fromEntity);
    }
}
