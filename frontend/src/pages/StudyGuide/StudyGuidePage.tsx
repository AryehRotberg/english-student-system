import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizStudyGuidesService } from '../../services/quiz-study-guides.service';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import styles from '../Quiz/QuizPage.module.css';

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

export function StudyGuidePage() {
    const { quizId, guideId } = useParams();

    const { data: studyGuides, isLoading } = useQuery({
        queryKey: ['study-guides', quizId],
        queryFn: () => quizStudyGuidesService.findByQuizId(quizId!),
        enabled: Boolean(quizId),
    });

    if (isLoading) return <div>Loading...</div>;

    const guide = studyGuides?.find((g) => g.id === guideId);

    if (!guide) return <div>Study guide not found.</div>;

    return (
        <div style={{ 
            background: '#ffffff', 
            border: '1px solid #d9dbe3', 
            borderRadius: '14px', 
            padding: '2.5rem 2rem',
            width: '100%'
        }}>
            <h1 style={{ color: '#111827', marginTop: 0 }}>{guide.topic}</h1>
            <div className={styles.topicMarkdown} style={{ marginTop: '2rem' }}>
                <ReactMarkdown
                    rehypePlugins={[
                        [rehypeSanitize, SANITIZE_SCHEMA],
                    ]}
                    remarkPlugins={[remarkGfm]}
                >
                    {guide.explanation}
                </ReactMarkdown>
            </div>
        </div>
    );
}
