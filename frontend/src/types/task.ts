export type DailyTask = {
    id: string;
    title: string;
    description: string;
    category: "listening" | "grammar" | "reading" | "vocabulary";
};

export type AssignmentTopic = {
    id: string;
    assignmentTitle: string;
    assignmentDescription: string;
    topicTitle: string;
    contentType: "quiz" | "text" | "writing" | "vocabulary";
    contentId: string;
};
