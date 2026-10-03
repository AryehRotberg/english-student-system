import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuizzes, useSubjects } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import { ENGLISH_SUBJECT_ID } from '../../types/subject';
import { levelName } from '../../utils/subjects';
import { QuizEditor } from './quizzes/QuizEditor';
import editorStyles from './quizzes/QuizEditor.module.css';
import { QuizForm } from './quizzes/QuizForm';
import { SubjectFilter } from './SubjectLevelFields';

const NEW_QUIZ = 'new';

/**
 * Quizzes and their questions in one place: the list, a new-quiz form, and a
 * quiz editor where questions are written, picked from the bank and ordered.
 * The open quiz lives in the URL (?tab=quizzes&quiz=<id>) so refresh and the
 * back button keep it.
 */
export function QuizzesSection() {
    const [searchParams, setSearchParams] = useSearchParams();
    const openQuiz = searchParams.get('quiz');
    const justCreated = searchParams.get('created') === '1';
    const [subjectFilter, setSubjectFilter] = useState('');
    const [search, setSearch] = useState('');
    const { data: quizzes = [], isLoading } = useQuizzes(
        subjectFilter ? { subjectId: subjectFilter } : {},
    );
    const { data: subjects = [] } = useSubjects();

    // "created" only opens the new-question form on the first visit; drop it
    // so a reload doesn't open it again (the editor has already read it).
    useEffect(() => {
        if (!justCreated) return;
        const next = new URLSearchParams(searchParams);
        next.delete('created');
        setSearchParams(next, { replace: true });
    }, [justCreated, searchParams, setSearchParams]);

    const navigate =(quiz: string | null, created = false) => {
        const next = new URLSearchParams(searchParams);
        next.delete('created');
        if (quiz) {
            next.set('quiz', quiz);
            if (created) next.set('created', '1');
        } else {
            next.delete('quiz');
        }
        setSearchParams(next);
    };

    if (openQuiz === NEW_QUIZ) {
        return (
            <div className={styles.section}>
                <button
                    type="button"
                    className={editorStyles.backLink}
                    onClick={() => navigate(null)}
                >
                    ← All quizzes
                </button>
                <div className={styles.sectionHeader}>
                    <h3>New quiz</h3>
                </div>
                <p className={styles.hintText}>
                    Start with the settings; the next step is adding questions.
                </p>
                <QuizForm
                    defaultSubjectId={subjectFilter || ENGLISH_SUBJECT_ID}
                    onSaved={(quiz) => navigate(quiz.id, true)}
                    onCancel={() => navigate(null)}
                />
            </div>
        );
    }

    if (openQuiz) {
        return (
            <QuizEditor
                key={openQuiz}
                quizId={openQuiz}
                justCreated={justCreated}
                onBack={() => navigate(null)}
            />
        );
    }

    const term = search.trim().toLowerCase();
    const visible = term
        ? quizzes.filter(
              (quiz) =>
                  quiz.title.toLowerCase().includes(term) ||
                  (quiz.description ?? '').toLowerCase().includes(term),
          )
        : quizzes;

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Quizzes</h3>
                <div className={editorStyles.listTools}>
                    <input
                        type="search"
                        dir="auto"
                        className={editorStyles.listSearch}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search quizzes…"
                        aria-label="Search quizzes"
                    />
                    <SubjectFilter
                        value={subjectFilter}
                        onChange={setSubjectFilter}
                    />
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => navigate(NEW_QUIZ)}
                    >
                        + New quiz
                    </button>
                </div>
            </div>

            <ul className={editorStyles.quizList}>
                {visible.map((quiz) => {
                    const subject = subjects.find(
                        (s) => s.id === quiz.subjectId,
                    );
                    const level = levelName(subject, quiz.levelId);

                    return (
                        <li key={quiz.id}>
                            <button
                                type="button"
                                className={editorStyles.quizCard}
                                onClick={() => navigate(quiz.id)}
                            >
                                <strong dir="auto">{quiz.title}</strong>
                                {quiz.description && (
                                    <span
                                        className={editorStyles.quizCardDesc}
                                        dir="auto"
                                    >
                                        {quiz.description}
                                    </span>
                                )}
                                <span className={editorStyles.badges}>
                                    {subject && (
                                        <span className={editorStyles.badge}>
                                            {subject.nameEn}
                                            {level ? ` · ${level}` : ''}
                                        </span>
                                    )}
                                    {quiz.gradingMode === 'teacher' && (
                                        <span className={editorStyles.badge}>
                                            Teacher graded
                                        </span>
                                    )}
                                    {quiz.questionsToAnswer && (
                                        <span className={editorStyles.badge}>
                                            Answer {quiz.questionsToAnswer}
                                        </span>
                                    )}
                                    {quiz.timeLimitMinutes && (
                                        <span className={editorStyles.badge}>
                                            {quiz.timeLimitMinutes} min
                                        </span>
                                    )}
                                </span>
                                <span className={editorStyles.openHint}>
                                    Open →
                                </span>
                            </button>
                        </li>
                    );
                })}
                {!isLoading && visible.length === 0 && (
                    <li className={styles.empty}>
                        {quizzes.length === 0
                            ? 'No quizzes yet. Create the first one.'
                            : 'No quizzes match the search.'}
                    </li>
                )}
            </ul>
        </div>
    );
}
