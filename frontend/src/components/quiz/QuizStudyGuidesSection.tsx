import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import styles from '../../pages/Quiz/QuizPage.module.css';
import type { QuizStudyGuide } from '../../types/quiz';

const SANITIZE_SCHEMA = {
    ...defaultSchema,
    tagNames: [
        ...(defaultSchema.tagNames || []),
        'table',
        'thead',
        'tbody',
        'tr',
        'td',
        'th',
    ],
    attributes: {
        ...defaultSchema.attributes,
        th: ['align'],
        td: ['align'],
    },
};

type QuizStudyGuidesSectionProps = {
    quizId: string;
    studyGuides: QuizStudyGuide[];
};

export function QuizStudyGuidesSection({
    quizId,
    studyGuides,
}: QuizStudyGuidesSectionProps) {
    const { t } = useTranslation();
    const [selectedStudyGuide, setSelectedStudyGuide] =
        useState<QuizStudyGuide | null>(null);

    if (studyGuides.length === 0) return null;

    return (
        <>
            <section className={styles.topicSection}>
                <h3>Study Guides for this quiz</h3>
                <div className={styles.topicGrid}>
                    {studyGuides.map((studyGuide) => (
                        <button
                            className={styles.topicCard}
                            key={studyGuide.id}
                            onClick={() => setSelectedStudyGuide(studyGuide)}
                            type="button"
                        >
                            <span dir="auto">
                                {studyGuide.title || studyGuide.topic}
                            </span>
                            <small>
                                {studyGuide.materialCount > 0
                                    ? t('lessons.files', {
                                          count: studyGuide.materialCount,
                                      })
                                    : 'Open explanation'}
                            </small>
                        </button>
                    ))}
                </div>
            </section>

            {selectedStudyGuide ? (
                <div
                    className={styles.topicModalOverlay}
                    onClick={() => setSelectedStudyGuide(null)}
                    role="presentation"
                >
                    <section
                        aria-label="Topic explanation"
                        className={styles.topicModal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.topicModalHeader}>
                            <h3 dir="auto">
                                {selectedStudyGuide.title ||
                                    selectedStudyGuide.topic}
                            </h3>
                            <div className={styles.topicModalButtons}>
                                {selectedStudyGuide.materialCount > 0 && (
                                    // Slides and interactive pages live on the
                                    // full lesson page; a new tab keeps the quiz.
                                    <button
                                        className={styles.closeTopicButton}
                                        onClick={() =>
                                            window.open(
                                                `/lessons/${selectedStudyGuide.id}`,
                                                '_blank',
                                            )
                                        }
                                        type="button"
                                    >
                                        {t('lessons.open')}
                                    </button>
                                )}
                                <button
                                    aria-label="Open in new page"
                                    className={styles.closeTopicButton}
                                    onClick={() =>
                                        window.open(
                                            `/quiz/${quizId}/guide/${selectedStudyGuide.id}`,
                                            '_blank',
                                        )
                                    }
                                    type="button"
                                >
                                    Open in New Page
                                </button>
                                <button
                                    aria-label="Close explanation"
                                    className={styles.closeTopicButton}
                                    onClick={() => setSelectedStudyGuide(null)}
                                    type="button"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className={styles.topicMarkdown}>
                            <ReactMarkdown
                                rehypePlugins={[
                                    [rehypeSanitize, SANITIZE_SCHEMA],
                                ]}
                                remarkPlugins={[remarkGfm]}
                            >
                                {selectedStudyGuide.explanation}
                            </ReactMarkdown>
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    );
}
