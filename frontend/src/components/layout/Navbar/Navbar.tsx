import { useQueryClient } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { useAuthUser } from '../../../hooks/queries';
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

  const handleLogout = async () => {
    await authService.logout();
    queryClient.setQueryData(['auth-user'], null);
    queryClient.removeQueries();
    navigate('/login', { replace: true });
  };

  return (
    <header className={sticky ? styles.shell : `${styles.shell} ${styles.static}`}>
      <div className={styles.logoWrap}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V3Z"
            fill="#4f46e5"
            opacity="0.2"
          />
          <line x1="8.5" y1="2" x2="8.5" y2="21" stroke="#4f46e5" strokeWidth="1.5" />
          <path d="M7 6H11" stroke="#4f46e5" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 9H11" stroke="#4f46e5" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 12H11" stroke="#4f46e5" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M13 6H17" stroke="#4f46e5" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M13 9H17" stroke="#4f46e5" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M13 12H17" stroke="#4f46e5" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className={styles.logoText}>English Student System</span>
      </div>

      <nav className={styles.nav} aria-label="Primary navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            {link.label}
          </NavLink>
        ))}
        {user?.role === 'teacher' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            Admin
          </NavLink>
        )}
      </nav>

      <div className={styles.actions}>
        <button className={styles.logoutButton} onClick={() => void handleLogout()} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}
