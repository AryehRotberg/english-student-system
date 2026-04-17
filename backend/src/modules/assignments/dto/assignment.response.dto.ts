import { ApiProperty } from '@nestjs/swagger';

export class AssignmentResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly userId: string;
    @ApiProperty()
    readonly title: string;
    @ApiProperty()
    readonly description: string;
    @ApiProperty()
    readonly dueDate: Date;
    @ApiProperty()
    readonly isCompleted: boolean;
    @ApiProperty()
    readonly createdAt: Date;
}
