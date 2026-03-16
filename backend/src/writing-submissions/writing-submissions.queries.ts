import { GetWritingSubmissionsFilterDto } from './dto/get-writing-submissions-filter.dto';

export const createWritingSubmissionQuery = `
    INSERT INTO
        WRITING_SUBMISSIONS (TASK_ID, USER_ID, CONTENT)
    VALUES
        ($1, $2, $3)
    RETURNING
        ID,
        TASK_ID AS "taskId",
        USER_ID AS "userId",
        CONTENT,
        FEEDBACK,
        SCORE,
        SUBMITTED_AT AS "submittedAt",
        REVIEWED_AT AS "reviewedAt"
`;

export const updateWritingSubmissionQuery = `
    UPDATE
        WRITING_SUBMISSIONS
    SET
        FEEDBACK = COALESCE($2, FEEDBACK),
        SCORE = COALESCE($3, SCORE),
        REVIEWED_AT = $4
    WHERE
        ID = $1
    RETURNING
        ID,
        TASK_ID AS "taskId",
        USER_ID AS "userId",
        CONTENT,
        FEEDBACK,
        SCORE,
        SUBMITTED_AT AS "submittedAt",
        REVIEWED_AT AS "reviewedAt"
`;

export function getWritingSubmissionsQuery(filter: GetWritingSubmissionsFilterDto): string {
    const conditions: string[] = [];

    if (filter.userId) {
        conditions.push('USER_ID = $1');
    }

    if (filter.taskId) {
        conditions.push('TASK_ID = $2');
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    return `
        SELECT
            ID,
            TASK_ID AS "taskId",
            USER_ID AS "userId",
            CONTENT,
            FEEDBACK,
            SCORE,
            SUBMITTED_AT AS "submittedAt",
            REVIEWED_AT AS "reviewedAt"
        FROM
            WRITING_SUBMISSIONS
        ${whereClause}
        ORDER BY
            SUBMITTED_AT DESC
    `;
}