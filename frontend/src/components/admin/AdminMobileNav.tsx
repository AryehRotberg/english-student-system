import styles from "../../pages/Admin/AdminPage.module.css";
import type { AdminTab, TabDef } from "./admin-tabs";

interface Props {
    tabs: TabDef[];
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

export function AdminMobileNav({ tabs, activeTab, onTabChange }: Props) {
    return (
        <nav className={styles.mobileBottomNav} role="tablist">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={
                        activeTab === tab.id
                            ? `${styles.mobileNavItem} ${styles.mobileNavItemActive}`
                            : styles.mobileNavItem
                    }
                    onClick={() => onTabChange(tab.id)}
                >
                    <span className={styles.mobileNavIcon}>{tab.icon}</span>
                    <span className={styles.mobileNavLabel}>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}
