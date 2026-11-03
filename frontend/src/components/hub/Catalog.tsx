import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Catalog.module.css';
import { ClockIcon, HeroRings, SearchIcon } from './icons';

/**
 * Building blocks shared by the student catalogs (quizzes, lessons,
 * vocabulary): a hero banner, a search field, titled groups of cards and an
 * empty state. Cards are page-specific but use classes from Catalog.module.css.
 */

export function CatalogHero({
    id,
    breadcrumb,
    title,
    subtitle,
    stats,
}: {
    id: string;
    breadcrumb?: ReactNode;
    title: string;
    subtitle: string;
    stats: { label: string; value: number }[];
}) {
    return (
        <section className={styles.hero} aria-labelledby={id}>
            <HeroRings className={styles.heroRings} />
            <div className={styles.heroText}>
                {breadcrumb && <p className={styles.breadcrumb}>{breadcrumb}</p>}
                <h1 id={id} className={styles.heroTitle}>
                    {title}
                </h1>
                <p className={styles.heroSubtitle}>{subtitle}</p>
            </div>
            <dl className={styles.heroStats}>
                {stats.map((stat) => (
                    <div key={stat.label} className={styles.heroStat}>
                        <dt>{stat.label}</dt>
                        <dd>{stat.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

export function SearchField({
    value,
    onChange,
    placeholder,
    ariaLabel,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    ariaLabel: string;
}) {
    return (
        <div className={styles.searchWrap}>
            <SearchIcon className={styles.searchIcon} />
            <input
                className={styles.searchInput}
                type="search"
                dir="auto"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={ariaLabel}
            />
        </div>
    );
}

export function CatalogGroup({
    id,
    title,
    countLabel,
    children,
}: {
    id: string;
    title: string;
    countLabel: string;
    children: ReactNode;
}) {
    return (
        <section className={styles.group} aria-labelledby={id}>
            <div className={styles.groupHead}>
                <h2 id={id} className={styles.groupTitle}>
                    {title}
                </h2>
                <span className={styles.groupCount}>{countLabel}</span>
            </div>
            {children}
        </section>
    );
}

export function CatalogEmpty({
    title,
    hint,
    onClear,
}: {
    title: string;
    // Shown with a clear button when filters hide everything.
    hint?: string;
    onClear?: () => void;
}) {
    const { t } = useTranslation();

    return (
        <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{title}</p>
            {hint && <p className={styles.emptyHint}>{hint}</p>}
            {onClear && (
                <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={onClear}
                >
                    {t('common.clearFilters')}
                </button>
            )}
        </div>
    );
}

const dueDateFormat: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
};

/** "Due …" / "Overdue since …" pill for assigned cards. */
export function DuePill({ due, overdue }: { due: Date; overdue: boolean }) {
    const { t, i18n } = useTranslation();

    return (
        <span className={overdue ? styles.duePillOverdue : styles.duePill}>
            <ClockIcon size={14} strokeWidth={2} />
            {t(overdue ? 'common.overdue' : 'common.due', {
                date: due.toLocaleDateString(i18n.language, dueDateFormat),
            })}
        </span>
    );
}
