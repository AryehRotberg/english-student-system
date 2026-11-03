import type { KeyboardEvent } from 'react';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CheckIcon,
    ChevronForwardIcon,
    ClockIcon,
    WaypointMark,
} from '../../components/hub/icons';
import styles from './AppPreview.module.css';

const VIEWS = ['dashboard', 'quiz', 'lesson'] as const;
type View = (typeof VIEWS)[number];

/** Tabs that switch between drawn previews of the student app. */
export function AppPreview() {
    const { t } = useTranslation();
    const baseId = useId();
    const [active, setActive] = useState<View>('dashboard');
    const tabRefs = useRef<Record<View, HTMLButtonElement | null>>({
        dashboard: null,
        quiz: null,
        lesson: null,
    });

    // Arrow keys move between tabs; the keys follow the reading direction.
    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const rtl = document.documentElement.dir === 'rtl';
        const step =
            event.key === 'ArrowRight'
                ? rtl ? -1 : 1
                : event.key === 'ArrowLeft'
                  ? rtl ? 1 : -1
                  : 0;
        if (step === 0) return;
        event.preventDefault();
        const index = VIEWS.indexOf(active);
        const next = VIEWS[(index + step + VIEWS.length) % VIEWS.length];
        setActive(next);
        tabRefs.current[next]?.focus();
    }

    return (
        <div className={styles.preview}>
            <div
                className={styles.tabs}
                role="tablist"
                aria-label={t('landing.platform.tabsLabel')}
                onKeyDown={onKeyDown}
            >
                {VIEWS.map((view) => (
                    <button
                        key={view}
                        ref={(node) => {
                            tabRefs.current[view] = node;
                        }}
                        type="button"
                        role="tab"
                        id={`${baseId}-tab-${view}`}
                        aria-controls={`${baseId}-panel`}
                        aria-selected={active === view}
                        tabIndex={active === view ? 0 : -1}
                        className={
                            active === view
                                ? `${styles.tab} ${styles.tabActive}`
                                : styles.tab
                        }
                        onClick={() => setActive(view)}
                    >
                        {t(`landing.platform.${view}.tab`)}
                    </button>
                ))}
            </div>

            <div
                role="tabpanel"
                id={`${baseId}-panel`}
                aria-labelledby={`${baseId}-tab-${active}`}
                className={styles.panel}
            >
                <div
                    className={styles.window}
                    role="img"
                    aria-label={t('landing.platform.illustration')}
                >
                    <div className={styles.chrome} aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <WaypointMark size={16} className={styles.chromeMark} />
                    </div>
                    <div className={styles.screen} aria-hidden="true">
                        {active === 'dashboard' && <DashboardMock />}
                        {active === 'quiz' && <QuizMock />}
                        {active === 'lesson' && <LessonMock />}
                    </div>
                </div>
                <p className={styles.caption}>
                    {t(`landing.platform.${active}.description`)}
                </p>
            </div>
        </div>
    );
}

function DashboardMock() {
    const { t } = useTranslation();
    const tasks = [
        { label: t('landing.preview.task1'), subject: t('landing.preview.subjectMath'), tone: styles.amber },
        { label: t('landing.preview.task2'), subject: t('landing.preview.subjectEnglish'), tone: styles.blue },
        { label: t('landing.preview.task3'), subject: t('landing.preview.subjectSe'), tone: styles.violet },
    ];
    const progress = [
        { subject: t('landing.preview.subjectMath'), value: 72 },
        { subject: t('landing.preview.subjectEnglish'), value: 58 },
        { subject: t('landing.preview.subjectAi'), value: 40 },
    ];

    return (
        <div className={styles.dashboard}>
            <div className={styles.rail}>
                <WaypointMark size={20} className={styles.railMark} />
                <span className={styles.railItemActive} />
                <span className={styles.railItem} />
                <span className={styles.railItem} />
                <span className={styles.railItem} />
            </div>
            <div className={styles.card}>
                <p className={styles.cardTitle}>{t('landing.preview.dueToday')}</p>
                <ul className={styles.taskList}>
                    {tasks.map((task) => (
                        <li key={task.label} className={styles.task}>
                            <span className={`${styles.dot} ${task.tone}`} />
                            <span className={styles.taskText}>
                                <span className={styles.taskLabel}>{task.label}</span>
                                <span className={styles.taskSubject}>{task.subject}</span>
                            </span>
                            <ChevronForwardIcon size={16} className={styles.flipRtl} />
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.card}>
                <p className={styles.cardTitle}>{t('landing.preview.progress')}</p>
                <ul className={styles.bars}>
                    {progress.map((row) => (
                        <li key={row.subject}>
                            <span className={styles.barLabel}>
                                <span>{row.subject}</span>
                                <span>{row.value}%</span>
                            </span>
                            <span className={styles.barTrack}>
                                <span
                                    className={styles.barFill}
                                    style={{ width: `${row.value}%` }}
                                />
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function QuizMock() {
    const { t } = useTranslation();
    const choices = [
        t('landing.preview.choice1'),
        t('landing.preview.choice2'),
        t('landing.preview.choice3'),
    ];

    return (
        <div className={styles.quiz}>
            <div className={styles.quizTop}>
                <span className={styles.quizCount}>{t('landing.preview.questionOf')}</span>
                <span className={styles.timer}>
                    <ClockIcon size={14} />
                    <span dir="ltr">12:40</span>
                </span>
            </div>
            <span className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: '30%' }} />
            </span>
            <p className={styles.question}>{t('landing.preview.question')}</p>
            <ul className={styles.choices}>
                {choices.map((choice, index) => (
                    <li
                        key={choice}
                        className={
                            index === 0
                                ? `${styles.choice} ${styles.choiceSelected}`
                                : styles.choice
                        }
                    >
                        <span className={styles.radio}>
                            {index === 0 && <CheckIcon size={12} />}
                        </span>
                        {choice}
                    </li>
                ))}
            </ul>
            <span className={styles.nextButton}>
                {t('landing.preview.next')}
                <ChevronForwardIcon size={14} className={styles.flipRtl} />
            </span>
        </div>
    );
}

function LessonMock() {
    const { t } = useTranslation();

    return (
        <div className={styles.lesson}>
            <div className={styles.quizTop}>
                <span className={styles.lessonTitle}>{t('landing.preview.lessonTitle')}</span>
                <span className={styles.slideCount}>{t('landing.preview.slideOf')}</span>
            </div>
            <div className={styles.slide}>
                <span className={styles.node}>{t('landing.preview.model')}</span>
                <span className={styles.arrows}>
                    <span className={styles.edge} />
                </span>
                <span className={styles.nodeStack}>
                    <span className={styles.node}>{t('landing.preview.tools')}</span>
                    <span className={styles.node}>{t('landing.preview.memory')}</span>
                </span>
                <span className={styles.arrows}>
                    <span className={styles.edge} />
                </span>
                <span className={`${styles.node} ${styles.nodeBright}`}>
                    {t('landing.preview.answer')}
                </span>
            </div>
            <div className={styles.thumbs}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <span
                        key={n}
                        className={n === 4 ? `${styles.thumb} ${styles.thumbActive}` : styles.thumb}
                    />
                ))}
            </div>
        </div>
    );
}
