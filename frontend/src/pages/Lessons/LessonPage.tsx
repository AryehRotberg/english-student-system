import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { RichText } from '../../components/content/RichText';
import { LessonMaterialViewer } from '../../components/lessons/LessonMaterialViewer';
import { useLesson } from '../../hooks/queries';
import { lessonTitle } from '../../types/lesson';
import styles from './Lessons.module.css';

export function LessonPage() {
    const { t } = useTranslation();
    const { lessonId } = useParams();
    const { data: lesson, isLoading, isError } = useLesson(lessonId);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (isLoading) {
        return <p className={styles.empty}>{t('common.loading')}</p>;
    }

    if (isError || !lesson) {
        return (
            <div className={styles.page}>
                <Link to="/lessons" className={styles.backLink}>
                    {t('lessons.allLessons')}
                </Link>
                <p className={styles.empty}>{t('lessons.notFound')}</p>
            </div>
        );
    }

    const materials = lesson.materials;
    const selected =
        materials.find((m) => m.id === selectedId) ?? materials[0] ?? null;
    const hasText = lesson.explanation.trim().length > 0;

    return (
        <div className={styles.page}>
            <Link to="/lessons" className={styles.backLink}>
                {t('lessons.allLessons')}
            </Link>

            <header className={styles.lessonHeader}>
                <span className={styles.badge} dir="auto">
                    {lesson.topicName}
                </span>
                <h1 className={styles.heading} dir="auto">
                    {lessonTitle(lesson)}
                </h1>
            </header>

            {!hasText && materials.length === 0 && (
                <p className={styles.empty}>{t('lessons.empty')}</p>
            )}

            {hasText && (
                <section className={styles.textCard}>
                    <RichText content={lesson.explanation} format="markdown" />
                </section>
            )}

            {selected && (
                <section className={styles.materials}>
                    {materials.length > 1 && (
                        <div
                            className={styles.materialTabs}
                            role="tablist"
                            aria-label={t('lessons.materials')}
                        >
                            {materials.map((material) => (
                                <button
                                    key={material.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={material.id === selected.id}
                                    className={`${styles.materialTab} ${
                                        material.id === selected.id
                                            ? styles.materialTabActive
                                            : ''
                                    }`}
                                    onClick={() => setSelectedId(material.id)}
                                >
                                    <span dir="auto">{material.title}</span>
                                    <span className={styles.kind}>
                                        {t(`lessons.${material.kind}`)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                    <LessonMaterialViewer key={selected.id} material={selected} />
                </section>
            )}
        </div>
    );
}
