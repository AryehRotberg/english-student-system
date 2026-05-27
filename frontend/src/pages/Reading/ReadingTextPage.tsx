import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { TextAudioPlayer } from '../../components/reading/TextAudioButton';
import { useReadingLibrary, useText } from '../../hooks/queries';
import type { ReadingItem } from '../../types/reading';
import styles from './ReadingTextPage.module.css';

const SANITIZE_SCHEMA = {
    ...defaultSchema,
    tagNames: [
        ...(defaultSchema.tagNames || []),
        'center',
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
        img: ['src', 'alt', 'title', 'width', 'height'],
    },
};

export function ReadingTextPage() {
    const { textId } = useParams<{ textId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const stateItem = (location.state as { item?: ReadingItem } | null)?.item;

    const { data: allItems = [] } = useReadingLibrary();
    const item: ReadingItem | undefined =
        stateItem ?? allItems.find((i) => i.id === textId);

    const { data: textDetail } = useText(textId);

    if (!item) {
        return (
            <div className={styles.wrapper}>
                <p>Text not found.</p>
                <button
                    className={styles.backButton}
                    onClick={() => navigate('/reading')}
                    type="button"
                >
                    ← Back to all texts
                </button>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <article className={styles.article}>
                <header className={styles.header}>
                    <div className={styles.headerMain}>
                        <h1 className={styles.title}>{item.title}</h1>
                        <span className={styles.meta}>
                            {item.level} · {item.minutes} min read
                        </span>
                    </div>
                    <button
                        className={styles.backButton}
                        onClick={() => navigate('/reading')}
                        type="button"
                    >
                        ← Back to all texts
                    </button>
                </header>

                <TextAudioPlayer textId={item.id} />

                <div className={styles.markdownBody}>
                    <ReactMarkdown
                        rehypePlugins={[
                            rehypeRaw,
                            [rehypeSanitize, SANITIZE_SCHEMA],
                        ]}
                        remarkPlugins={[remarkGfm]}
                    >
                        {item.content}
                    </ReactMarkdown>
                </div>
            </article>

            {textDetail?.quiz && (
                <button
                    className={styles.quizCard}
                    onClick={() => navigate(`/quiz/${textDetail.quiz!.id}`)}
                    type="button"
                >
                    <div className={styles.quizCardLabel}>
                        Quiz for this text
                    </div>
                    <div className={styles.quizCardTitle}>
                        {textDetail.quiz.title}
                    </div>
                    {textDetail.quiz.description && (
                        <div className={styles.quizCardDesc}>
                            {textDetail.quiz.description}
                        </div>
                    )}
                </button>
            )}

            {textDetail?.vocabularyTopic && (
                <button
                    className={styles.vocabCard}
                    onClick={() =>
                        navigate(
                            `/vocab?topicId=${textDetail.vocabularyTopic!.id}`,
                        )
                    }
                    type="button"
                >
                    <div className={styles.vocabCardLabel}>
                        Vocabulary for this text
                    </div>
                    <div className={styles.vocabCardTitle}>
                        {textDetail.vocabularyTopic.topic}
                    </div>
                    {textDetail.vocabularyTopic.description && (
                        <div className={styles.vocabCardDesc}>
                            {textDetail.vocabularyTopic.description}
                        </div>
                    )}
                </button>
            )}
        </div>
    );
}
