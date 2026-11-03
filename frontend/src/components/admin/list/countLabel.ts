/** "13 total" when nothing hides rows, else "4 of 13". */
export function countLabel(shown: number, total: number, filtered: boolean) {
    return filtered ? `${shown} of ${total}` : `${total} total`;
}
