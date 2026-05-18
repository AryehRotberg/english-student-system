export type ReadingLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ReadingItem = {
    id: string;
    title: string;
    level: ReadingLevel;
    minutes: number;
    content: string;
};
