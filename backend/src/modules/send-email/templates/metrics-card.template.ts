type MetricsCardParams = {
    scorePercent: number;
    earnedPoints?: string;
    totalPoints?: string;
    progressPercent: number;
    completedItems?: number;
    totalItems?: number;
};

export const metricsCard = ({
    scorePercent,
    earnedPoints,
    totalPoints,
    progressPercent,
    completedItems,
    totalItems,
}: MetricsCardParams): string => {
    return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <p class="stat-label">Quiz score</p>
                        <p class="stat-value">${scorePercent}%</p>
                        <p class="stat-subtext">${earnedPoints ?? '0'}/${totalPoints ?? '0'} points</p>
                    </div>
                    <div class="stat-card">
                        <p class="stat-label">Assignment progress</p>
                        <p class="stat-value">${progressPercent}%</p>
                        <p class="stat-subtext">${completedItems ?? 0}/${totalItems ?? 0} items completed</p>
                    </div>
                </div>
`;
};
