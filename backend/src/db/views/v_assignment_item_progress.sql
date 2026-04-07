-- Reusable view: per-assignment, per-content-type item completion counts.
-- Referenced by: dashboard/get-content-progress.sql, send-email/get-assignment-completion-summary.sql
-- Must be applied once to the database (e.g. via Supabase SQL editor).
CREATE OR REPLACE VIEW v_assignment_item_progress AS
SELECT
    AI.ASSIGNMENT_ID,
    AI.CONTENT_TYPE,
    COUNT(*)::INT AS total_items,
    COUNT(*) FILTER (
        WHERE
            AI.STATUS = 'completed'
    )::INT AS completed_items
FROM
    ASSIGNMENT_ITEMS AI
GROUP BY
    AI.ASSIGNMENT_ID,
    AI.CONTENT_TYPE;
