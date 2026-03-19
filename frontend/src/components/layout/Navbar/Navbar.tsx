import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/auth.service";
import { useAuthUser } from "../../../hooks/queries";
import styles from "./Navbar.module.css";

const links = [
    { label: "Dashboard", to: "/" },
    { label: "Reading", to: "/reading" },
    { label: "Practice", to: "/practice" },
    { label: "Vocab", to: "/vocab" },
    { label: "Quiz", to: "/quiz" },
];

type NavbarProps = {
    sticky?: boolean;
};

export function Navbar({ sticky = true }: NavbarProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: user } = useAuthUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const displayName = user?.name?.trim() || "Student";
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

    useEffect(() => {
        if (!isMobileMenuOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        await authService.logout();
        queryClient.setQueryData(["auth-user"], null);
        queryClient.removeQueries();
        setIsMobileMenuOpen(false);
        navigate("/login", { replace: true });
    };

    return (
        <>
            <header
                className={
                    sticky ? styles.shell : `${styles.shell} ${styles.static}`
                }
            >
                <div className={styles.logoWrap}>
                    <div className={styles.logoIcon} aria-hidden="true">
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4 4.5C4 3.67157 4.67157 3 5.5 3H18.5C19.3284 3 20 3.67157 20 4.5V19.5C20 20.3284 19.3284 21 18.5 21H5.5C4.67157 21 4 20.3284 4 19.5V4.5Z"
                                stroke="currentColor"
                                strokeWidth="1.7"
                            />
                            <path
                                d="M8 3V21"
                                stroke="currentColor"
                                strokeWidth="1.7"
                            />
                            <path
                                d="M10.5 7.5H16"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                            <path
                                d="M10.5 11H16"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                            <path
                                d="M10.5 14.5H16"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <span className={styles.logoText}>
                        English Student System
                    </span>
                </div>

                <nav className={styles.nav} aria-label="Primary navigation">
                    {links.map((link) => (
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
                    {user?.role === "teacher" && (
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
                            {initials || "S"}
                        </span>
                    </div>
                </div>

                <div
                    aria-hidden={!isMobileMenuOpen}
                    className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.mobileOverlayOpen : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                <aside
                    aria-label="Mobile menu"
                    className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.mobileDrawerOpen : ""}`}
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
                                {initials || "S"}
                            </span>
                        </div>
                    </div>

                    <nav
                        className={styles.mobileNav}
                        aria-label="Mobile navigation"
                    >
                        {links.map((link) => (
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

                        {user?.role === "teacher" && (
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
