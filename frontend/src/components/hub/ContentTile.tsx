import type { AssignmentItemContentType } from '../../services/assignments.service';
import type { QuizCategory } from '../../types/quiz';
import styles from './ContentTile.module.css';
import {
    BookIcon,
    CardsIcon,
    ChecklistIcon,
    HeadphonesIcon,
    LettersIcon,
    PenIcon,
    ScreenIcon,
} from './icons';
import { contentTypeTone, quizCategoryTone, toneClass } from './tones';

function contentTypeIcon(type: AssignmentItemContentType, size: number) {
    switch (type) {
        case 'quiz':
            return <ChecklistIcon size={size} />;
        case 'reading':
            return <BookIcon size={size} />;
        case 'vocabulary':
            return <LettersIcon size={size} />;
        case 'writing':
            return <PenIcon size={size} />;
        case 'lesson':
            return <ScreenIcon size={size} />;
    }
}

function quizCategoryIcon(category: QuizCategory | null, size: number) {
    switch (category) {
        case 'reading':
            return <BookIcon size={size} />;
        case 'grammar':
            return <LettersIcon size={size} />;
        case 'vocabulary':
            return <CardsIcon size={size} />;
        case 'listening':
            return <HeadphonesIcon size={size} />;
        case 'custom':
            return <PenIcon size={size} />;
        default:
            return <ChecklistIcon size={size} />;
    }
}

type TileSize = 'sm' | 'md' | 'lg';

const iconSize: Record<TileSize, number> = { sm: 18, md: 20, lg: 20 };

/** Square tinted tile with the icon of an assignment item's content type. */
export function ContentTypeTile({
    type,
    size = 'md',
}: {
    type: AssignmentItemContentType;
    size?: TileSize;
}) {
    return (
        <span
            aria-hidden="true"
            className={`${styles.tile} ${styles[size]} ${toneClass[contentTypeTone[type]]}`}
        >
            {contentTypeIcon(type, iconSize[size])}
        </span>
    );
}

/** Tile for a quiz; subjects without categories pass null and get the accent. */
export function QuizCategoryTile({
    category,
    size = 'md',
}: {
    category: QuizCategory | null;
    size?: TileSize;
}) {
    const tone = category ? quizCategoryTone[category] : 'accent';

    return (
        <span
            aria-hidden="true"
            className={`${styles.tile} ${styles[size]} ${toneClass[tone]}`}
        >
            {quizCategoryIcon(category, iconSize[size])}
        </span>
    );
}
