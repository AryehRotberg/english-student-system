import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthUser } from '../../../hooks/queries';
import { authService } from '../../../services/auth.service';
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

export function Navbar({ sticky = true }: NavbarProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: user } = useAuthUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const displayName = user?.name?.trim() || 'Student';
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

    const handleLogout = async () => {
        await authService.logout();
        queryClient.setQueryData(['auth-user'], null);
        queryClient.removeQueries();
        setIsMobileMenuOpen(false);
        navigate('/login', { replace: true });
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
                    {user?.role === 'teacher' && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.link} ${styles.active}`
                                    : styles.link
                            }
                        >
                            Admin
                        </NavLink>
                    )}
                </nav>

                <div className={styles.actions}>
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

                        {user?.role === 'teacher' && (
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    isActive
                                        ? `${styles.mobileLink} ${styles.mobileActive}`
                                        : styles.mobileLink
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Admin
                            </NavLink>
                        )}
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
