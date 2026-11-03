import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuizzes, useSubjects } from '../../hooks/queries';
import { ENGLISH_SUBJECT_ID } from '../../types/subject';
import { SearchIcon } from '../hub/icons';
import { QuizEditor } from './quizzes/QuizEditor';
import { QuizForm } from './quizzes/QuizForm';
import { QuizTable } from './quizzes/QuizTable';
import { BackLink } from './list/AdminList';
import listStyles from './list/AdminList.module.css';
import { NEW_ITEM as NEW_QUIZ } from './list/useEditorParam';



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
    const [levelFilter, setLevelFilter] = useState('');
    const [search, setSearch] = useState('');
    const { data: allQuizzes = [] } = useQuizzes();
    const { data: quizzes = [], isLoading } = useQuizzes({
        ...(subjectFilter && { subjectId: subjectFilter }),
        ...(levelFilter && { levelId: levelFilter }),
    });
    const { data: subjects = [] } = useSubjects();
    const levels =
        subjects.find((subject) => subject.id === subjectFilter)?.levels ?? [];

    // "created" only opens the new-question form on the first visit; drop it
    // so a reload doesn't open it again (the editor has already read it).
    useEffect(() => {
        if (!justCreated) return;
        const next = new URLSearchParams(searchParams);
        next.delete('created');
        setSearchParams(next, { replace: true });
    }, [justCreated, searchParams, setSearchParams]);

    const navigate = (quiz: string | null, created = false) => {
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
            <div className={listStyles.editor}>
                <BackLink onClick={() => navigate(null)}>All quizzes</BackLink>
                <section className={listStyles.editorCard}>
                    <h2 className={listStyles.editorTitle}>New quiz</h2>
                    <p className={listStyles.editorHint}>
                        Start with the settings; the next step is adding
                        questions.
                    </p>
                    <QuizForm
                        defaultSubjectId={subjectFilter || ENGLISH_SUBJECT_ID}
                        onSaved={(quiz) => navigate(quiz.id, true)}
                        onCancel={() => navigate(null)}
                    />
                </section>
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
    const isFiltered = Boolean(term || subjectFilter || levelFilter);

    const clearFilters = () => {
        setSearch('');
        setSubjectFilter('');
        setLevelFilter('');
    };

    return (
        <section className={listStyles.panel} aria-labelledby="quiz-list-heading">
            <div className={listStyles.toolbar} role="search">
                <h2 id="quiz-list-heading" className={listStyles.panelTitle}>
                    All quizzes{' '}
                    <span className={listStyles.panelCount}>
                        ·{' '}
                        {isFiltered
                            ? `${visible.length} of ${allQuizzes.length}`
                            : `${allQuizzes.length} total`}
                    </span>
                </h2>
                <div className={listStyles.searchWrap}>
                    <SearchIcon className={listStyles.searchIcon} />
                    <input
                        type="search"
                        dir="auto"
                        className={listStyles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title"
                        aria-label="Search quizzes"
                    />
                </div>
                <div className={listStyles.field}>
                    <label htmlFor="admin-quiz-subject" className={listStyles.fieldLabel}>
                        Subject
                    </label>
                    <select
                        id="admin-quiz-subject"
                        className={listStyles.select}
                        value={subjectFilter}
                        onChange={(e) => {
                            setSubjectFilter(e.target.value);
                            setLevelFilter('');
                        }}
                    >
                        <option value="">All subjects</option>
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.nameEn}
                            </option>
                        ))}
                    </select>
                </div>
                {levels.length > 0 && (
                    <div className={listStyles.field}>
                        <label htmlFor="admin-quiz-level" className={listStyles.fieldLabel}>
                            Level
                        </label>
                        <select
                            id="admin-quiz-level"
                            className={listStyles.select}
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                        >
                            <option value="">All levels</option>
                            {levels.map((level) => (
                                <option key={level.id} value={level.id}>
                                    {level.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {isLoading ? (
                <p className={listStyles.loading} role="status">
                    Loading quizzes…
                </p>
            ) : visible.length > 0 ? (
                <QuizTable
                    quizzes={visible}
                    subjects={subjects}
                    onOpen={(quizId) => navigate(quizId)}
                />
            ) : (
                <div className={listStyles.emptyState}>
                    <p className={listStyles.emptyTitle}>
                        {isFiltered
                            ? 'No quizzes match these filters'
                            : 'No quizzes yet'}
                    </p>
                    <p className={listStyles.emptyHint}>
                        {isFiltered
                            ? 'Try a different word, subject or level — or create a new quiz.'
                            : 'Create the first one with “New quiz” above.'}
                    </p>
                    {isFiltered && (
                        <button
                            type="button"
                            className={listStyles.ghostButton}
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
