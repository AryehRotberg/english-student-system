import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DotsIcon, PenIcon, SearchIcon } from '../../hub/icons';
import styles from './AdminList.module.css';

/**
 * The admin list layout, shared by every content tab: a panel whose toolbar
 * holds the title, a count, search and filters, then a table (or an empty
 * state). Rows use the table classes from AdminList.module.css.
 */

export function AdminListPanel({
    id,
    title,
    count,
    toolbar,
    children,
}: {
    id: string;
    title: string;
    // e.g. "13 total" or "4 of 13".
    count?: string;
    toolbar?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className={styles.panel} aria-labelledby={id}>
            <div className={styles.toolbar}>
                <h2 id={id} className={styles.panelTitle}>
                    {title}
                    {count && (
                        <>
                            {' '}
                            <span className={styles.panelCount}>· {count}</span>
                        </>
                    )}
                </h2>
                {toolbar}
            </div>
            {children}
        </section>
    );
}

export function AdminSearch({
    value,
    onChange,
    placeholder,
    label,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
}) {
    return (
        <div className={styles.searchWrap} role="search">
            <SearchIcon className={styles.searchIcon} />
            <input
                type="search"
                dir="auto"
                className={styles.searchInput}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={label}
            />
        </div>
    );
}

export function AdminSelect({
    id,
    label,
    value,
    onChange,
    children,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.fieldLabel}>
                {label}
            </label>
            <select
                id={id}
                className={styles.select}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {children}
            </select>
        </div>
    );
}

export function AdminEmpty({
    title,
    hint,
    onClear,
}: {
    title: string;
    hint?: string;
    onClear?: () => void;
}) {
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
                    Clear filters
                </button>
            )}
        </div>
    );
}

export function EditButton({
    label,
    onClick,
    children = 'Edit',
}: {
    // Accessible name, e.g. "Edit Past Simple".
    label: string;
    onClick: () => void;
    children?: ReactNode;
}) {
    return (
        <button
            type="button"
            className={styles.editButton}
            aria-label={label}
            onClick={onClick}
        >
            <PenIcon size={15} strokeWidth={2} />
            {children}
        </button>
    );
}

export type RowMenuItem = {
    label: string;
    onSelect: () => void;
    danger?: boolean;
    disabled?: boolean;
};

/** The ⋯ button at the end of a row, for the less common actions. */
export function RowMenu({
    label,
    items,
}: {
    label: string;
    items: RowMenuItem[];
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);

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
    }, [open, close]);

    return (
        <div className={styles.menuRoot} ref={rootRef}>
            <button
                type="button"
                className={styles.iconButton}
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <DotsIcon />
            </button>
            {open && (
                <div className={styles.menu} role="menu">
                    {items.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            role="menuitem"
                            className={
                                item.danger ? styles.menuDanger : styles.menuItem
                            }
                            disabled={item.disabled}
                            onClick={() => {
                                close();
                                item.onSelect();
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/** "← All lessons" above an editor view. */
export function BackLink({
    onClick,
    children,
}: {
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button type="button" className={styles.backLink} onClick={onClick}>
            <span aria-hidden="true" className={styles.backArrow}>
                ←
            </span>
            {children}
        </button>
    );
}
