export type ReadingLevel = 'A2' | 'B1' | 'B2' | 'C1';

export type ReadingItem = {
    id: string;
    title: string;
    level: ReadingLevel;
    minutes: number;
    content: string;
};
