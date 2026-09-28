export type DailyTask = {
    id: string;
    title: string;
    description: string;
    category: 'quiz' | 'reading' | 'writing' | 'vocabulary';
};

export type AssignmentTopic = {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    assignmentDescription: string;
    topicTitle: string;
    contentType: 'quiz' | 'reading' | 'writing' | 'vocabulary';
    contentId: string;
    subjectId: string | null;
};
