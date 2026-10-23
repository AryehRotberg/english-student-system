import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDuration, remainingTime } from '../../utils/exam';
import styles from './QuizCountdown.module.css';

type Props = {
    startedAt: string;
    timeLimitMinutes: number;
    // Shown once time runs out; defaults to the exam "submit now" message.
    timeUpLabel?: string;
    // Called once when time runs out, or on mount if it already has.
    onTimeUp?: () => void;
};

/** Time left on a timed attempt, counted from when it started. */
export function QuizCountdown({
    startedAt,
    timeLimitMinutes,
    timeUpLabel,
    onTimeUp,
}: Props) {
    const { t } = useTranslation();
    const [now, setNow] = useState(() => Date.now());
    const onTimeUpRef = useRef(onTimeUp);

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    });

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const left = remainingTime(startedAt, timeLimitMinutes, now);
    const isTimeUp = left <= 0;

    useEffect(() => {
        if (isTimeUp) {
            onTimeUpRef.current?.();
        }
    }, [isTimeUp]);

    return (
        <span
            className={styles.countdown}
            data-urgent={left < 5 * 60_000}
            role="timer"
        >
            {isTimeUp
                ? (timeUpLabel ?? t('exam.timeUp'))
                : t('exam.timeLeft', { time: formatDuration(left) })}
        </span>
    );
}
