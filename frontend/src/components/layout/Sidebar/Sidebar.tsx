import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCurrentSubject } from '../../../contexts/subject-context';
import { useAuthUser } from '../../../hooks/queries';
import { adminTabGroups, adminTabs, resolveAdminTab } from '../../admin/admin-tabs';
import {
    BookIcon,
    ChecklistIcon,
    ClipboardIcon,
    CloseIcon,
    HomeIcon,
    LettersIcon,
    ScreenIcon,
} from '../../hub/icons';
import styles from './Sidebar.module.css';

type SidebarLink = { labelKey: string; to: string; icon: ReactNode };
type SidebarGroup = { labelKey: string | null; links: SidebarLink[] };

// Reading and vocabulary are English-only; the other subjects
// work through lessons, quizzes and exams.
const englishGroups: SidebarGroup[] = [
    {
        labelKey: null,
        links: [
            { labelKey: 'nav.dashboard', to: '/', icon: <HomeIcon /> },
            { labelKey: 'nav.assignments', to: '/assignments', icon: <ClipboardIcon /> },
        ],
    },
    {
        labelKey: 'nav.learn',
        links: [
            { labelKey: 'nav.lessons', to: '/lessons', icon: <ScreenIcon /> },
            { labelKey: 'nav.reading', to: '/reading', icon: <BookIcon /> },
            { labelKey: 'nav.vocab', to: '/vocab', icon: <LettersIcon /> },
        ],
    },
    {
        labelKey: 'nav.practice',
        links: [
            { labelKey: 'nav.quiz', to: '/quiz', icon: <ChecklistIcon /> },
        ],
    },
];

const subjectGroups: SidebarGroup[] = [
    {
        labelKey: null,
        links: [
            { labelKey: 'nav.dashboard', to: '/', icon: <HomeIcon /> },
            { labelKey: 'nav.assignments', to: '/assignments', icon: <ClipboardIcon /> },
            { labelKey: 'nav.lessons', to: '/lessons', icon: <ScreenIcon /> },
            { labelKey: 'nav.exams', to: '/quiz', icon: <ChecklistIcon /> },
        ],
    },
];

function linkClass({ isActive }: { isActive: boolean }) {
    return isActive ? `${styles.item} ${styles.itemActive}` : styles.item;
}

// Matches the breakpoint in Sidebar.module.css where the drawer takes over.
const DRAWER_QUERY = '(max-width: 1099px)';

/**
 * The rail on wide screens; on phones and tablets a drawer that slides in
 * from the start edge. While open it locks the page scroll and closes on
 * Escape, the backdrop, a link, or the screen growing past the breakpoint.
 */
function SidebarFrame({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}) {
    const { t } = useTranslation();
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const drawer = window.matchMedia(DRAWER_QUERY);
        if (!drawer.matches) {
            onClose();
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const onResize = () => {
            if (!drawer.matches) onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        drawer.addEventListener('change', onResize);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
            drawer.removeEventListener('change', onResize);
        };
    }, [open, onClose]);

    return (
        <>
            <div
                aria-hidden="true"
                className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
                onClick={onClose}
            />
            <div
                id="app-sidebar"
                className={`${styles.rail} ${open ? styles.railOpen : ''}`}
            >
                <div className={styles.drawerHead}>
                    <span className={styles.drawerTitle}>{t('nav.menu')}</span>
                    <button
                        ref={closeRef}
                        type="button"
                        className={styles.drawerClose}
                        aria-label={t('nav.closeMenu')}
                        onClick={onClose}
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>
                {children}
            </div>
        </>
    );
}

/**
 * The site's main navigation at the start edge. Wide screens show it
 * alongside the page; phones and tablets in a drawer opened from the top bar.
 */
export function Sidebar({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const location = useLocation();
    const { data: user } = useAuthUser();
    const { isEnglish } = useCurrentSubject();
    const isTeacher = user?.role === 'teacher';

    if (isTeacher) {
        const activeTab = resolveAdminTab(
            new URLSearchParams(location.search).get('tab'),
        );

        return (
            <SidebarFrame open={open} onClose={onClose}>
            <nav className={styles.sidebar} aria-label={t('nav.primary')}>
                <div className={styles.heading}>
                    <span className={styles.title}>Admin panel</span>
                    <span className={styles.subtitle}>Curator controls</span>
                </div>
                {adminTabGroups.map((group) => (
                    <div key={group.id} className={styles.group}>
                        <span className={styles.groupLabel}>{group.label}</span>
                        {adminTabs
                            .filter((tab) => tab.group === group.id)
                            .map((tab) => {
                                const active =
                                    location.pathname === '/admin' &&
                                    activeTab === tab.id;

                                return (
                                    <Link
                                        key={tab.id}
                                        to={`/admin?tab=${tab.id}`}
                                        className={linkClass({ isActive: active })}
                                        aria-current={active ? 'page' : undefined}
                                        title={tab.label}
                                        onClick={onClose}
                                    >
                                        <span className={styles.icon}>{tab.icon}</span>
                                        <span className={styles.label}>{tab.label}</span>
                                    </Link>
                                );
                            })}
                    </div>
                ))}
            </nav>
            </SidebarFrame>
        );
    }

    const groups = isEnglish ? englishGroups : subjectGroups;

    return (
        <SidebarFrame open={open} onClose={onClose}>
            <nav className={styles.sidebar} aria-label={t('nav.primary')}>
            {groups.map((group, index) => (
                <div key={group.labelKey ?? index} className={styles.group}>
                    {group.labelKey && (
                        <span className={styles.groupLabel}>
                            {t(group.labelKey)}
                        </span>
                    )}
                    {group.links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/'}
                            className={linkClass}
                            title={t(link.labelKey)}
                            onClick={onClose}
                        >
                            <span className={styles.icon}>{link.icon}</span>
                            <span className={styles.label}>
                                {t(link.labelKey)}
                            </span>
                        </NavLink>
                    ))}
                </div>
            ))}
        </nav>
        </SidebarFrame>
    );
}
