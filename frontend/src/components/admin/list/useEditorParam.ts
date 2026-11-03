import { useSearchParams } from 'react-router-dom';

/** Value of an editor param while the "new item" form is open. */
export const NEW_ITEM = 'new';

/**
 * Which item an admin tab has open (`?lesson=<id>`, `?lesson=new`), kept in
 * the URL so refresh and the back button keep it.
 */
export function useEditorParam(key: string) {
    const [searchParams, setSearchParams] = useSearchParams();
    const value = searchParams.get(key);

    const open = (id: string) => {
        const next = new URLSearchParams(searchParams);
        next.set(key, id);
        setSearchParams(next);
    };

    const close = () => {
        const next = new URLSearchParams(searchParams);
        next.delete(key);
        setSearchParams(next);
    };

    return {
        openId: value && value !== NEW_ITEM ? value : null,
        isNew: value === NEW_ITEM,
        open,
        close,
    };
}
