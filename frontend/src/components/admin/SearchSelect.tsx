import { useEffect, useId, useMemo, useState } from 'react';
import { searchOptions, type SearchOption } from '../../utils/search-options';
import styles from './SearchSelect.module.css';

type Props = {
    id?: string;
    options: SearchOption[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    /** For when there is no visible <label for={id}>. */
    ariaLabel?: string;
    required?: boolean;
    /** Classes for the outer box (layout) and the text box (look). */
    className?: string;
    inputClassName?: string;
};

// The part of the label matching the query, emphasised so it is easy to spot.
function Highlight({ text, query }: { text: string; query: string }) {
    const needle = query.trim().toLocaleLowerCase();
    const at = needle ? text.toLocaleLowerCase().indexOf(needle) : -1;
    if (at < 0) return <>{text}</>;
    return (
        <>
            {text.slice(0, at)}
            <mark className={styles.mark}>{text.slice(at, at + needle.length)}</mark>
            {text.slice(at + needle.length)}
        </>
    );
}

/**
 * A dropdown you can type into, for lists too long to scan in a plain
 * <select>. Typing narrows the list; each result shows what it sits under
 * (its path), since a tree's indentation is gone once the list is filtered.
 */
export function SearchSelect({
    id,
    options,
    value,
    onChange,
    placeholder = 'Type to search…',
    ariaLabel,
    required,
    className,
    inputClassName,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const listId = useId();

    const results = useMemo(() => searchOptions(options, query), [options, query]);
    const selected = options.find((option) => option.id === value);
    const searching = query.trim() !== '';

    const optionId = (index: number) => `${listId}-option-${index}`;

    // Keep the highlighted option in view while moving with the arrow keys.
    useEffect(() => {
        if (!open) return;
        document
            .getElementById(optionId(active))
            ?.scrollIntoView({ block: 'nearest' });
        // optionId only depends on listId, which never changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, active]);

    const openList = () => {
        if (open) return;
        setOpen(true);
        setQuery('');
        // Start on the current choice, so its neighbours are in view.
        setActive(Math.max(0, options.findIndex((option) => option.id === value)));
    };

    const close = () => {
        setOpen(false);
        setQuery('');
    };

    const choose = (optionId: string) => {
        onChange(optionId);
        close();
    };

    return (
        <div className={`${styles.picker} ${className ?? ''}`}>
            <input
                id={id}
                type="text"
                role="combobox"
                dir="auto"
                autoComplete="off"
                spellCheck={false}
                aria-label={ariaLabel}
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-required={required}
                aria-activedescendant={
                    open && results.length > 0 ? optionId(active) : undefined
                }
                // Closed, the box shows the current choice; open, it is a
                // search box with the current choice as its placeholder.
                value={open ? query : (selected?.label ?? '')}
                placeholder={open && selected ? selected.label : placeholder}
                className={`${styles.input} ${inputClassName ?? ''}`}
                onFocus={openList}
                onClick={openList}
                onBlur={close}
                onChange={(event) => {
                    setOpen(true);
                    setQuery(event.target.value);
                    setActive(0);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (!open) return openList();
                        const step = event.key === 'ArrowDown' ? 1 : -1;
                        setActive((current) =>
                            Math.min(results.length - 1, Math.max(0, current + step)),
                        );
                    } else if (event.key === 'Enter') {
                        // Picks an option instead of submitting the form.
                        if (!open) return;
                        event.preventDefault();
                        const option = results[active];
                        if (option) choose(option.id);
                    } else if (event.key === 'Escape' && open) {
                        event.preventDefault();
                        close();
                    }
                }}
            />
            <span className={styles.chevron} aria-hidden="true">
                ▾
            </span>

            {open && (
                <ul
                    id={listId}
                    role="listbox"
                    className={styles.list}
                    // Keep focus in the input so a click is not lost to blur.
                    onMouseDown={(event) => event.preventDefault()}
                >
                    {results.length === 0 && (
                        <li className={styles.empty}>
                            {options.length === 0
                                ? 'Nothing to choose from yet.'
                                : `No matches for “${query.trim()}”.`}
                        </li>
                    )}
                    {results.map((option, index) => {
                        const depth = option.depth ?? 0;
                        const path = option.path ?? [];
                        return (
                            <li
                                key={option.id}
                                id={optionId(index)}
                                role="option"
                                dir="auto"
                                aria-selected={option.id === value}
                                className={`${styles.option} ${
                                    index === active ? styles.optionActive : ''
                                } ${option.id === value ? styles.optionSelected : ''}`}
                                style={
                                    searching || depth === 0
                                        ? undefined
                                        : { paddingInlineStart: `${12 + depth * 18}px` }
                                }
                                onMouseMove={() => setActive(index)}
                                onClick={() => choose(option.id)}
                            >
                                <span
                                    className={
                                        !searching && option.depth === 0
                                            ? styles.rootName
                                            : undefined
                                    }
                                >
                                    <Highlight text={option.label} query={query} />
                                </span>
                                {/* In the indented tree the path is already visible. */}
                                {(searching || option.depth === undefined) &&
                                    path.length > 0 && (
                                        <span className={styles.path}>
                                            {path.join(' › ')}
                                        </span>
                                    )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
