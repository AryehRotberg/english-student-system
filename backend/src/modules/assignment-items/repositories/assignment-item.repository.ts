import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AssignmentItemResponseDto } from '../dto/assignment-item.response.dto';
import { AssignmentItem } from '../entities/assignment-item.entity';

@Injectable()
export class AssignmentItemRepository extends Repository<AssignmentItem> {
    private readonly BASE_QUERY = `
    SELECT
        AI.ID,
        A.ID AS "assignmentId",
        A.TITLE AS "assignmentTitle",
        A.DESCRIPTION AS "assignmentDescription",
        A.DUE_DATE AS "assignmentDueDate",
        AI.IS_COMPLETED AS "isCompleted",
        AI.CONTENT_TYPE AS "contentType",
        AI.CONTENT_ID AS "contentId",
        COALESCE(Q.TITLE, T.TITLE, W.TITLE, VT.TOPIC) AS "title"
    FROM
        ASSIGNMENTS A
        JOIN ASSIGNMENT_ITEMS AI ON AI.ASSIGNMENT_ID = A.ID
        LEFT JOIN QUIZZES Q ON AI.CONTENT_TYPE = 'quiz'
        AND AI.CONTENT_ID = Q.ID
        LEFT JOIN TEXTS T ON AI.CONTENT_TYPE = 'text'
        AND AI.CONTENT_ID = T.ID
        LEFT JOIN WRITING_TASKS W ON AI.CONTENT_TYPE = 'writing'
        AND AI.CONTENT_ID = W.ID
        LEFT JOIN VOCABULARY_TOPICS VT ON AI.CONTENT_TYPE = 'vocabulary'
        AND AI.CONTENT_ID = VT.ID
    `;

    constructor(dataSource: DataSource) {
        super(AssignmentItem, dataSource.createEntityManager());
    }

    async findByUserId(userId: string): Promise<AssignmentItemResponseDto[]> {
        return this.query(
            this.BASE_QUERY +
                `
            WHERE
                A.USER_ID = $1
            ORDER BY
                A.CREATED_AT DESC,
                A.DUE_DATE ASC NULLS LAST;`,
            [userId],
        );
    }

    async findActiveByUserId(
        userId: string,
    ): Promise<AssignmentItemResponseDto[]> {
        return this.query(
            this.BASE_QUERY +
                `
            WHERE
                A.USER_ID = $1
                AND AI.IS_COMPLETED = false
            ORDER BY
                A.CREATED_AT DESC,
                A.DUE_DATE ASC NULLS LAST;`,
            [userId],
        );
    }
}
