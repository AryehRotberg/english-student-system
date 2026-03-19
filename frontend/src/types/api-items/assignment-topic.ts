export type AssignmentTopicApiItem = {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    assignmentDescription: string;
    status: "assigned" | "completed";
    contentType: "quiz" | "text" | "writing" | "vocabulary";
    contentId: string;
    title: string;
};
