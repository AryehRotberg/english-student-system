import { WritingTask } from '../entities/writing-task.entity';
import { ApiProperty } from '@nestjs/swagger';

export class WritingTaskResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly title: string;
    @ApiProperty()
    readonly instructions: string;
    @ApiProperty()
    readonly minWords: number;
    @ApiProperty()
    readonly createdAt: Date;

    private constructor(props: WritingTaskResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(task: WritingTask): WritingTaskResponseDto {
        return new WritingTaskResponseDto({
            id: task.id,
            title: task.title,
            instructions: task.instructions,
            minWords: task.minWords,
            createdAt: task.createdAt,
        });
    }

    static fromEntities(tasks: WritingTask[]): WritingTaskResponseDto[] {
        return tasks.map(WritingTaskResponseDto.fromEntity);
    }
}