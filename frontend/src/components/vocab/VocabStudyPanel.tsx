import { useMemo, useState } from "react";
import type { VocabularyTopicWithWords } from "../../types/vocabulary";
import styles from "./VocabStudyPanel.module.css";

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

            <button
                type="button"
                className={styles.cardViewport}
                onClick={() => setIsFlipped((value) => !value)}
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
                    </article>

                    <article
                        className={`${styles.cardFace} ${styles.cardBack}`}
                    >
                        <div className={styles.details}>
                            <p>
                                <strong>Meaning:</strong>{" "}
                                {currentCard.meaning || "-"}
                            </p>
                            <p>
                                <strong>Example:</strong>{" "}
                                {currentCard.example || "-"}
                            </p>
                            <p>
                                <strong>Translation:</strong>{" "}
                                {currentCard.translation || "-"}
                            </p>
                        </div>
                    </article>
                </div>
            </button>

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
