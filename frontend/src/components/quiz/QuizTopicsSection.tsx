import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import styles from '../../pages/Quiz/QuizPage.module.css';
import type { QuizTopic } from '../../types/quiz';

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

type QuizTopicsSectionProps = {
    topics: QuizTopic[];
};

export function QuizTopicsSection({ topics }: QuizTopicsSectionProps) {
    const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);

    if (topics.length === 0) return null;

    return (
        <>
            <section className={styles.topicSection}>
                <h3>Topics for this quiz</h3>
                <div className={styles.topicGrid}>
                    {topics.map((topic) => (
                        <button
                            className={styles.topicCard}
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            type="button"
                        >
                            <span>{topic.topic}</span>
                            <small>Open explanation</small>
                        </button>
                    ))}
                </div>
            </section>

            {selectedTopic ? (
                <div
                    className={styles.topicModalOverlay}
                    onClick={() => setSelectedTopic(null)}
                    role="presentation"
                >
                    <section
                        aria-label="Topic explanation"
                        className={styles.topicModal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.topicModalHeader}>
                            <h3>{selectedTopic.topic}</h3>
                            <button
                                aria-label="Close explanation"
                                className={styles.closeTopicButton}
                                onClick={() => setSelectedTopic(null)}
                                type="button"
                            >
                                Close
                            </button>
                        </div>

                        <div className={styles.topicMarkdown}>
                            <ReactMarkdown
                                rehypePlugins={[
                                    [rehypeSanitize, SANITIZE_SCHEMA],
                                ]}
                                remarkPlugins={[remarkGfm]}
                            >
                                {selectedTopic.explanation}
                            </ReactMarkdown>
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    );
}
