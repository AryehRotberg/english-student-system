import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { adminTabs } from '../../admin/admin-tabs';
import { useAuthUser } from '../../../hooks/queries';
import { authService } from '../../../services/auth.service';
import {
    disablePushNotifications,
    enablePushNotifications,
    getPushSubscriptionStatus,
    isPushSupported,
} from '../../../utils/push-notifications';
import styles from './Navbar.module.css';

const links = [
    { label: 'Dashboard', to: '/' },
    { label: 'Reading', to: '/reading' },
    { label: 'Practice', to: '/practice' },
    { label: 'Vocab', to: '/vocab' },
    { label: 'Quiz', to: '/quiz' },
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
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { data: user } = useAuthUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);
    const displayName = user?.name?.trim() || 'Student';
    const isStudent = user?.role !== 'teacher';
    const showPushToggle = isStudent && isPushSupported();

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
                <NavLink to="/" className={styles.logoWrap}>
                    <img src="/open-book.png" alt="" width="24" height="24" />
                    <span className={styles.logoText}>
                        English Student System
                    </span>
                </NavLink>

                <nav className={styles.nav} aria-label="Primary navigation">
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
                                {link.label}
                            </NavLink>
                        ))}
                </nav>

                <div className={styles.actions}>
                    {showPushToggle && (
                        <button
                            aria-label={
                                pushEnabled
                                    ? 'Disable notifications'
                                    : 'Enable notifications'
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
                                    ? 'Disable notifications'
                                    : 'Enable notifications'
                            }
                            type="button"
                        >
                            <BellIcon muted={!pushEnabled} />
                        </button>
                    )}

                    <button
                        aria-label="Open menu"
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
                        Logout
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
                    aria-label="Mobile menu"
                    className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.mobileDrawerOpen : ''}`}
                >
                    <div className={styles.mobileDrawerHeader}>
                        <p className={styles.mobileDrawerTitle}>Menu</p>
                        <button
                            aria-label="Close menu"
                            className={styles.mobileClose}
                            onClick={() => setIsMobileMenuOpen(false)}
                            type="button"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.mobileProfileRow}>
                        <span className={styles.mobileAppName}>
                            English Student System
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

                    <nav
                        className={styles.mobileNav}
                        aria-label="Mobile navigation"
                    >
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
                                    {link.label}
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
                        Logout
                    </button>
                </aside>
            </header>
        </>
    );
}
