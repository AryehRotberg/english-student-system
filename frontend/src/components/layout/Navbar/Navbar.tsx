import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { adminTabs } from '../../admin/admin-tabs';
import { useCurrentSubject } from '../../../contexts/subject-context';
import { useAuthUser } from '../../../hooks/queries';
import { authService } from '../../../services/auth.service';
import {
    disablePushNotifications,
    enablePushNotifications,
    getPushSubscriptionStatus,
    isPushSupported,
} from '../../../utils/push-notifications';
import { subjectName } from '../../../utils/subjects';
import { LanguageToggle } from '../LanguageToggle';
import styles from './Navbar.module.css';

type NavLinkDef = { labelKey: string; to: string };

// Reading, practice and vocabulary are English-only; the other subjects work
// through quizzes and exams.
const englishLinks: NavLinkDef[] = [
    { labelKey: 'nav.dashboard', to: '/' },
    { labelKey: 'nav.assignments', to: '/assignments' },
    { labelKey: 'nav.reading', to: '/reading' },
    { labelKey: 'nav.practice', to: '/practice' },
    { labelKey: 'nav.vocab', to: '/vocab' },
    { labelKey: 'nav.quiz', to: '/quiz' },
];

const subjectLinks: NavLinkDef[] = [
    { labelKey: 'nav.dashboard', to: '/' },
    { labelKey: 'nav.assignments', to: '/assignments' },
    { labelKey: 'nav.exams', to: '/quiz' },
];

type NavbarProps = {
    sticky?: boolean;
};

function BellIcon({ muted }: { muted: boolean }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {muted ? (
                <>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    <path d="M18.63 13A17.9 17.9 0 0 1 18 8" />
                    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
                    <path d="M18 8a6 6 0 0 0-9.33-5" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </>
            ) : (
                <>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </>
            )}
        </svg>
    );
}

export function Navbar({ sticky = true }: NavbarProps) {
    const { t, i18n } = useTranslation();
    const {
        availableSubjects,
        currentSubject,
        isEnglish,
        setCurrentSubjectId,
    } = useCurrentSubject();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { data: user } = useAuthUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);
    const displayName = user?.name?.trim() || t('nav.defaultName');
    const isStudent = user?.role !== 'teacher';
    // Teachers get notified of new submissions to grade.
    const showPushToggle = Boolean(user) && isPushSupported();
    const links = isEnglish ? englishLinks : subjectLinks;
    const showSubjectSwitcher = isStudent && availableSubjects.length > 1;

    const subjectSwitcher = showSubjectSwitcher && currentSubject && (
        <select
            className={styles.subjectSelect}
            value={currentSubject.id}
            onChange={(event) => {
                setCurrentSubjectId(event.target.value);
                navigate('/');
            }}
            aria-label={t('subjects.switcher')}
        >
            {availableSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                    {subjectName(subject, i18n.language)}
                </option>
            ))}
        </select>
    );

    const currentAdminTab =
        new URLSearchParams(location.search).get('tab') ?? 'pending-students';
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

    useEffect(() => {
        if (!isMobileMenuOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!showPushToggle) {
            return;
        }

        getPushSubscriptionStatus().then(setPushEnabled);
    }, [showPushToggle]);

    const handleLogout = async () => {
        await authService.logout();
        queryClient.setQueryData(['auth-user'], null);
        queryClient.removeQueries();
        setIsMobileMenuOpen(false);
        navigate('/login', { replace: true });
    };

    const handleTogglePush = async () => {
        setPushBusy(true);

        try {
            if (pushEnabled) {
                await disablePushNotifications();
                setPushEnabled(false);
            } else {
                await enablePushNotifications();
                setPushEnabled(true);
            }
        } catch (err) {
            console.error('Failed to toggle push notifications', err);
        } finally {
            setPushBusy(false);
        }
    };

    return (
        <>
            <header
                className={[
                    styles.shell,
                    sticky ? '' : styles.static,
                    isMobileMenuOpen ? styles.shellMenuOpen : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {/* The switcher shares the logo's grid cell so the header keeps
                    its three columns; on small screens it moves into the drawer. */}
                <div className={styles.brand}>
                    <NavLink to="/" className={styles.logoWrap}>
                        <img src="/open-book.png" alt="" width="24" height="24" />
                        <span className={styles.logoText}>{t('app.name')}</span>
                    </NavLink>

                    {subjectSwitcher}
                </div>

                <nav className={styles.nav} aria-label={t('nav.primary')}>
                    {user?.role !== 'teacher' &&
                        links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    isActive
                                        ? `${styles.link} ${styles.active}`
                                        : styles.link
                                }
                            >
                                {t(link.labelKey)}
                            </NavLink>
                        ))}
                </nav>

                <div className={styles.actions}>
                    <LanguageToggle className={styles.languageButton} />

                    {showPushToggle && (
                        <button
                            aria-label={
                                pushEnabled
                                    ? t('nav.disableNotifications')
                                    : t('nav.enableNotifications')
                            }
                            className={[
                                styles.pushToggleButton,
                                pushEnabled ? styles.pushToggleButtonActive : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            disabled={pushBusy}
                            onClick={() => void handleTogglePush()}
                            title={
                                pushEnabled
                                    ? t('nav.disableNotifications')
                                    : t('nav.enableNotifications')
                            }
                            type="button"
                        >
                            <BellIcon muted={!pushEnabled} />
                        </button>
                    )}

                    <button
                        aria-label={t('nav.openMenu')}
                        aria-expanded={isMobileMenuOpen}
                        className={styles.menuToggle}
                        onClick={() => setIsMobileMenuOpen(true)}
                        type="button"
                    >
                        <span className={styles.menuLine} />
                        <span className={styles.menuLine} />
                        <span className={styles.menuLine} />
                    </button>

                    <button
                        className={styles.logoutButton}
                        onClick={() => void handleLogout()}
                        type="button"
                    >
                        {t('nav.logout')}
                    </button>

                    <div className={styles.profileBlock}>
                        <span className={styles.profileName}>
                            {displayName}
                        </span>
                        <span className={styles.avatar} aria-hidden="true">
                            {initials || 'S'}
                        </span>
                    </div>
                </div>

                <div
                    aria-hidden={!isMobileMenuOpen}
                    className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.mobileOverlayOpen : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                <aside
                    aria-label={t('nav.menu')}
                    className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.mobileDrawerOpen : ''}`}
                >
                    <div className={styles.mobileDrawerHeader}>
                        <p className={styles.mobileDrawerTitle}>
                            {t('nav.menu')}
                        </p>
                        <button
                            aria-label={t('nav.closeMenu')}
                            className={styles.mobileClose}
                            onClick={() => setIsMobileMenuOpen(false)}
                            type="button"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.mobileProfileRow}>
                        <span className={styles.mobileAppName}>
                            {t('app.name')}
                        </span>
                        <div className={styles.mobileProfileBlock}>
                            <span className={styles.mobileProfileName}>
                                {displayName}
                            </span>
                            <span
                                className={styles.mobileAvatar}
                                aria-hidden="true"
                            >
                                {initials || 'S'}
                            </span>
                        </div>
                    </div>

                    {subjectSwitcher && (
                        <div className={styles.mobileSubjectRow}>
                            {subjectSwitcher}
                        </div>
                    )}

                    <nav className={styles.mobileNav} aria-label={t('nav.menu')}>
                        {user?.role !== 'teacher' &&
                            links.map((link) => (
                                <NavLink
                                    key={`mobile-${link.to}`}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        isActive
                                            ? `${styles.mobileLink} ${styles.mobileActive}`
                                            : styles.mobileLink
                                    }
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t(link.labelKey)}
                                </NavLink>
                            ))}

                        {user?.role === 'teacher' &&
                            adminTabs.map((tab) => (
                                <NavLink
                                    key={`mobile-admin-${tab.id}`}
                                    to={`/admin?tab=${tab.id}`}
                                    className={
                                        location.pathname === '/admin' &&
                                        currentAdminTab === tab.id
                                            ? `${styles.mobileAdminLink} ${styles.mobileActive}`
                                            : styles.mobileAdminLink
                                    }
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className={styles.mobileAdminIcon}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </NavLink>
                            ))}
                    </nav>

                    <button
                        className={styles.mobileLogout}
                        onClick={() => void handleLogout()}
                        type="button"
                    >
                        {t('nav.logout')}
                    </button>
                </aside>
            </header>
        </>
    );
}
