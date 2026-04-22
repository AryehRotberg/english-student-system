import styles from '../../pages/Admin/AdminPage.module.css';
import type { AdminTab, TabDef } from './admin-tabs';

interface Props {
    tabs: TabDef[];
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

export function AdminMobileNav({ tabs, activeTab, onTabChange }: Props) {
    return (
        <nav
            className={styles.mobileTabStrip}
            role="tablist"
            aria-label="Admin sections"
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-label={tab.label}
                    className={
                        activeTab === tab.id
                            ? `${styles.mobileTabItem} ${styles.mobileTabItemActive}`
                            : styles.mobileTabItem
                    }
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.icon}
                </button>
            ))}
        </nav>
    );
}
