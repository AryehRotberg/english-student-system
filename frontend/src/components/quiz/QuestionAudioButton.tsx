import { useQuestionAudio } from '../../hooks/queries';
import { AudioNotFoundError } from '../../services/audio.service';
import styles from './QuestionAudioButton.module.css';

type QuestionAudioButtonProps = {
    questionId: string;
};

export function QuestionAudioButton({ questionId }: QuestionAudioButtonProps) {
    const {
        data: url,
        isLoading,
        isError,
        error,
    } = useQuestionAudio(questionId);

    const handlePlay = () => {
        if (url) {
            new Audio(url).play().catch(() => undefined);
        }
    };

    if (isError && error instanceof AudioNotFoundError) {
        return null;
    }

    if (isError) {
        return null;
    }

    return (
        <button
            type="button"
            className={`${styles.speakerButton}${isLoading ? ` ${styles.speakerButtonLoading}` : ''}`}
            onClick={handlePlay}
            disabled={isLoading || !url}
            aria-label="Play question audio"
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M3 7.5h2.5L10 3v14l-4.5-4.5H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"
                    fill="currentColor"
                />
                <path
                    d="M13 7a4 4 0 0 1 0 6M15.5 4.5a8 8 0 0 1 0 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
        </button>
    );
}
