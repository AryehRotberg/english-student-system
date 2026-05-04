import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AssignmentCreateDto } from '../dto/assignment.create.dto';
import { Assignment } from '../entities/assignment.entity';

@Injectable()
export class AssignmentRepository extends Repository<Assignment> {
    private readonly CREATE_SQL = `
    WITH
		CREATE_ASSIGNMENT AS (
			INSERT INTO
				ASSIGNMENTS (USER_ID, TITLE, DESCRIPTION, DUE_DATE)
			VALUES
				($1, $2, $3, $4)
			RETURNING
				ID,
				USER_ID AS "userId",
				TITLE,
				DESCRIPTION,
				DUE_DATE AS "dueDate",
				CREATED_AT AS "createdAt"
		),
		CREATE_ITEMS AS (
			INSERT INTO
				ASSIGNMENT_ITEMS (ASSIGNMENT_ID, CONTENT_TYPE, CONTENT_ID)
			SELECT
				CA.ID,
				ITEM."contentType",
				ITEM."contentId"::UUID
			FROM
				CREATE_ASSIGNMENT CA
				CROSS JOIN JSONB_TO_RECORDSET($5::JSONB) AS ITEM ("contentType" TEXT, "contentId" TEXT)
			WHERE
				$5 IS NOT NULL
		)
	SELECT
		*
	FROM
		CREATE_ASSIGNMENT;
	`;

    constructor(dataSource: DataSource) {
        super(Assignment, dataSource.createEntityManager());
    }

    async createAssignment(dto: AssignmentCreateDto): Promise<Assignment> {
        const { userId, title, description, dueDate, items } = dto;

        const rawResults = await this.query<Assignment>(this.CREATE_SQL, [
            userId,
            title,
            description,
            dueDate,
            items ? JSON.stringify(items) : null,
        ]);

        return this.create(rawResults[0] as Assignment);
    }
}
