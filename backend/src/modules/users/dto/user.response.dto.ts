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

    private constructor(props: User) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.role = props.role;
        this.teacherId = props.teacherId;
        this.teacherName = props.teacherName;
        this.teacherEmail = props.teacherEmail;
        this.isApproved = props.isApproved;
        this.createdAt = props.createdAt;
    }

    static fromEntity(user: User): UserResponseDto {
        return new UserResponseDto(user);
    }

    static fromEntities(users: User[]): UserResponseDto[] {
        return users.map(UserResponseDto.fromEntity);
    }
}
