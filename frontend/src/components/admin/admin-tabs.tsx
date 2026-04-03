export type AdminTab =
    | "quizzes"
    | "questions"
    | "quiz-builder"
    | "texts"
    | "student-progress";

export interface TabDef {
    id: AdminTab;
    label: string;
    description: string;
    icon: React.ReactNode;
}

function ClipboardIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="9" y="2" width="6" height="4" rx="1" />
            <path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
    );
}

function HelpCircleIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

function WrenchIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    );
}

function FileTextIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    );
}

function BarChartIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
            <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
    );
}

export const adminTabs: TabDef[] = [
    {
        id: "student-progress",
        label: "Student Progress",
        description:
            "Track academic performance, quiz completion rates, and individual learning milestones.",
        icon: <BarChartIcon />,
    },
    {
        id: "quizzes",
        label: "Quizzes",
        description: "Create and manage quizzes for your students.",
        icon: <ClipboardIcon />,
    },
    {
        id: "questions",
        label: "Questions",
        description:
            "Add and edit fill-in-the-blank and multiple-choice questions.",
        icon: <HelpCircleIcon />,
    },
    {
        id: "quiz-builder",
        label: "Quiz Builder",
        description: "Assemble questions into quizzes and set the order.",
        icon: <WrenchIcon />,
    },
    {
        id: "texts",
        label: "Texts",
        description: "Manage reading texts used across lessons and quizzes.",
        icon: <FileTextIcon />,
    },
];
