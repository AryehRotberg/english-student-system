export function toProgressBar(percent: number): string {
    const clamped = Math.max(0, Math.min(100, percent));
    const filled = Math.round(clamped / 10);
    const empty = 10 - filled;

    return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${clamped}%`;
}
