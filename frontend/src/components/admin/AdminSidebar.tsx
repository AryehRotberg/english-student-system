import styles from '../../pages/Admin/AdminPage.module.css';
import type { AdminTab, TabDef } from './admin-tabs';

interface Props {
    tabs: TabDef[];
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

export function AdminSidebar({ tabs, activeTab, onTabChange }: Props) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarBrand}>
                <h2 className={styles.sidebarTitle}>Admin Panel</h2>
                <p className={styles.sidebarSub}>Curator Controls</p>
            </div>
            <nav className={styles.sidebarNav} role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={
                            activeTab === tab.id
                                ? `${styles.navItem} ${styles.navItemActive}`
                                : styles.navItem
                        }
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className={styles.navIcon}>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}
