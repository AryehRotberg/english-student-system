import { useMemo, useState } from "react";
import { useVocabAudio } from "../../hooks/queries";
import { AudioNotFoundError } from "../../services/audio.service";
import type { VocabAudioType } from "../../services/audio.service";
import type { VocabularyTopicWithWords } from "../../types/vocabulary";
import styles from "./VocabStudyPanel.module.css";

type AudioButtonProps = {
    word: string;
    type: VocabAudioType;
    label: string;
};

function AudioButton({ word, type, label }: AudioButtonProps) {
    const { data: url, isLoading, isError, error } = useVocabAudio(word, type);

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (url) {
            new Audio(url).play().catch(() => undefined);
        }
    };

    if (isError) {
        if (error instanceof AudioNotFoundError) {
            return (
                <span className={styles.audioUnavailable}>
                    &#x1F507; {label} audio unavailable
                </span>
            );
        }
        return (
            <span className={styles.audioError}>
                &#x26A0;&#xFE0F; {label} audio failed to load
            </span>
        );
    }

    return (
        <button
            type="button"
            className={`${styles.audioButton}${isLoading ? ` ${styles.audioButtonLoading}` : ""}`}
            onClick={handlePlay}
            disabled={isLoading || !url}
            aria-label={`Play ${label} audio for ${word}`}
        >
            {isLoading ? "Loading\u2026" : `\uD83D\uDD0A ${label}`}
        </button>
    );
}

type VocabStudyPanelProps = {
    topic: VocabularyTopicWithWords;
    isLoadingWords?: boolean;
    onBack: () => void;
};

export function VocabStudyPanel({
    topic,
    isLoadingWords = false,
    onBack,
}: VocabStudyPanelProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const totalCards = topic.words.length;
    const currentCard = topic.words[currentIndex];

    const progressPercent = useMemo(() => {
        if (totalCards === 0) {
            return 0;
        }

        return ((currentIndex + 1) / totalCards) * 100;
    }, [currentIndex, totalCards]);

    const moveNext = () => {
        if (currentIndex >= totalCards - 1) {
            return;
        }

        setCurrentIndex((value) => value + 1);
        setIsFlipped(false);
    };

    const movePrevious = () => {
        if (currentIndex <= 0) {
            return;
        }

        setCurrentIndex((value) => value - 1);
        setIsFlipped(false);
    };

    if (isLoadingWords) {
        return (
            <section className={styles.panel}>
                <div className={styles.headerRow}>
                    <h2 className={styles.topicTitle}>{topic.topic}</h2>
                    <button
                        className={styles.backButton}
                        type="button"
                        onClick={onBack}
                    >
                        Back to topics
                    </button>
                </div>
                <p className={styles.emptyState}>Loading words...</p>
            </section>
        );
    }

    if (!currentCard) {
        return (
            <section className={styles.panel}>
                <div className={styles.headerRow}>
                    <h2 className={styles.topicTitle}>{topic.topic}</h2>
                    <button
                        className={styles.backButton}
                        type="button"
                        onClick={onBack}
                    >
                        Back to topics
                    </button>
                </div>
                <p className={styles.emptyState}>
                    No words found in this topic yet.
                </p>
            </section>
        );
    }

    return (
        <section className={styles.panel}>
            <div className={styles.headerRow}>
                <h2 className={styles.topicTitle}>{topic.topic}</h2>
                <button
                    className={styles.backButton}
                    type="button"
                    onClick={onBack}
                >
                    Back to topics
                </button>
            </div>

            <p className={styles.cardCount}>
                Card {currentIndex + 1} of {totalCards}
            </p>

            <div className={styles.progressBar} aria-hidden="true">
                <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div
                role="button"
                tabIndex={0}
                className={styles.cardViewport}
                onClick={() => setIsFlipped((value) => !value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsFlipped((value) => !value);
                    }
                }}
                aria-label={isFlipped ? "Show front side" : "Show back side"}
            >
                <div
                    className={`${styles.cardInner} ${isFlipped ? styles.cardInnerFlipped : ""}`}
                >
                    <article
                        className={`${styles.cardFace} ${styles.cardFront}`}
                    >
                        <h3 className={styles.word}>{currentCard.word}</h3>
                        <p className={styles.hint}>Tap card to flip</p>
                        <div className={styles.audioRow}>
                            <AudioButton
                                word={currentCard.word}
                                type="word"
                                label="Pronunciation"
                            />
                        </div>
                    </article>

                    <article
                        className={`${styles.cardFace} ${styles.cardBack}`}
                    >
                        <div className={styles.details}>
                            <div className={styles.detailItem}>
                                <p>
                                    <strong>Meaning:</strong>{" "}
                                    {currentCard.meaning || "-"}
                                </p>
                                <AudioButton
                                    word={currentCard.word}
                                    type="meaning"
                                    label="Meaning"
                                />
                            </div>
                            <div className={styles.detailItem}>
                                <p>
                                    <strong>Example:</strong>{" "}
                                    {currentCard.example || "-"}
                                </p>
                                <AudioButton
                                    word={currentCard.word}
                                    type="example"
                                    label="Example"
                                />
                            </div>
                            <p>
                                <strong>Translation:</strong>{" "}
                                {currentCard.translation || "-"}
                            </p>
                        </div>
                    </article>
                </div>
            </div>

            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.arrowButton}
                    onClick={movePrevious}
                    disabled={currentIndex === 0}
                >
                    ←
                </button>
                <button
                    type="button"
                    className={styles.arrowButton}
                    onClick={moveNext}
                    disabled={currentIndex === totalCards - 1}
                >
                    →
                </button>
            </div>
        </section>
    );
}
