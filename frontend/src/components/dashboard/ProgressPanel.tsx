import type { ProgressItem } from '../../types/progress';
import { toProgressBar } from '../../utils/progress';
import styles from './ProgressPanel.module.css';

type ProgressPanelProps = {
    progress: ProgressItem[];
};

export function ProgressPanel({ progress }: ProgressPanelProps) {
    return (
        <section className={styles.panel}>
            <h2 className={styles.heading}>Progress</h2>

            <ul className={styles.list}>
                {progress.map((item) => (
                    <li className={styles.row} key={item.id}>
                        <span className={styles.label}>{item.label}</span>
                        <span
                            className={styles.bar}
                            aria-label={`${item.label} ${item.percent}%`}
                        >
                            {toProgressBar(item.percent)}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
