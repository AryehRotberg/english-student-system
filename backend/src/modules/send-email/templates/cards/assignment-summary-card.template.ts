type AssignmentSummaryCardParams = {
    assignmentTitle?: string;
    quizTitle?: string;
};

export const assignmentSummaryCard = ({
    assignmentTitle,
    quizTitle,
}: AssignmentSummaryCardParams): string => {
    if (!assignmentTitle && !quizTitle) return '';

    return `
                <div class="assignment-box">
                    <h2 class="assignment-title">${assignmentTitle ?? 'Assignment summary'}</h2>
                    <p class="assignment-description">Quiz: ${quizTitle ?? 'Current quiz'}</p>
                </div>
`;
};
