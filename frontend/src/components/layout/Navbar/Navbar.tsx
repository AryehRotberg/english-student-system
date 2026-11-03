import { useQueryClient } from '@tanstack/react-query';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthUser } from '../../../hooks/queries';
import { authService } from '../../../services/auth.service';
import {
    disablePushNotifications,
    enablePushNotifications,
    getPushSubscriptionStatus,
    isPushSupported,
} from '../../../utils/push-notifications';
import {
    ChevronDownIcon,
    MenuIcon,
    ShieldIcon,
    WaypointMark,
} from '../../hub/icons';
import { LanguageToggle } from '../LanguageToggle';
import styles from './Navbar.module.css';

function BellIcon({ muted }: { muted: boolean }) {
    return (
        <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
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

/** Closes a popup on a click outside `rootRef` or on Escape. */
function useDismiss(
    open: boolean,
    close: () => void,
    rootRef: RefObject<HTMLElement | null>,
) {
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) close();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, close, rootRef]);
}

function ProfileMenu({
    displayName,
    initials,
    onLogout,
}: {
    displayName: string;
    initials: string;
    onLogout: () => void;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);
    useDismiss(open, close, rootRef);

    return (
        <div className={styles.profileMenu} ref={rootRef}>
            <button
                type="button"
                className={styles.profileButton}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t('nav.account')}
                onClick={() => setOpen((value) => !value)}
            >
                <span className={styles.avatar} aria-hidden="true">
                    {initials}
                </span>
                <span className={styles.profileName} dir="auto">
                    {displayName}
                </span>
                <ChevronDownIcon
                    size={16}
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                />
            </button>
            {open && (
                <div className={styles.profilePopup}>
                    <p className={styles.popupName} dir="auto">
                        {displayName}
                    </p>
                    <button
                        type="button"
                        className={styles.profileLogout}
                        onClick={() => {
                            setOpen(false);
                            onLogout();
                        }}
                    >
                        {t('nav.logout')}
                    </button>
                </div>
            )}
        </div>
    );
}

/** The top bar: brand, subject, language, notifications and the account. */
export function Navbar({
    menuOpen,
    onOpenMenu,
}: {
    menuOpen: boolean;
    onOpenMenu: () => void;
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: user } = useAuthUser();
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);
    const displayName = user?.name?.trim() || t('nav.defaultName');
    const isStudent = user?.role !== 'teacher';
    // Teachers get notified of new submissions to grade.
    const showPushToggle = Boolean(user) && isPushSupported();

    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

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
        <header className={styles.shell}>
            <div className={styles.brand}>
                {/* Phones only: the sidebar is hidden in a drawer. */}
                <button
                    type="button"
                    className={styles.menuButton}
                    aria-label={t('nav.openMenu')}
                    aria-expanded={menuOpen}
                    aria-controls="app-sidebar"
                    onClick={onOpenMenu}
                >
                    <MenuIcon size={22} />
                </button>
                <NavLink to={isStudent ? '/' : '/admin'} className={styles.logoWrap}>
                    <span className={styles.logoMark} aria-hidden="true">
                        <WaypointMark size={26} />
                    </span>
                    <span className={styles.logoText}>{t('app.name')}</span>
                </NavLink>

                {!isStudent && (
                    <span className={styles.adminBadge}>
                        <ShieldIcon size={13} />
                        {t('nav.adminBadge')}
                    </span>
                )}
            </div>

            <div className={styles.actions}>
                <LanguageToggle className={styles.languageButton} withIcon />

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

                <ProfileMenu
                    displayName={displayName}
                    initials={initials || 'S'}
                    onLogout={() => void handleLogout()}
                />
            </div>
        </header>
    );
}
