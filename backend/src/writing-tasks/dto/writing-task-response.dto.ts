import { WritingTask } from '../entities/writing-task.entity';

export class WritingTaskResponseDto {
    readonly id: string;
    readonly title: string;
    readonly instructions: string;
    readonly minWords: number;
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