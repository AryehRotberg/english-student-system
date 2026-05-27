import { useEffect, useRef, useState } from 'react';
import { AudioNotFoundError, audioService } from '../../services/audio.service';
import styles from './TextAudioPlayer.module.css';

type Props = { textId: string };

function formatTime(s: number): string {
    if (!isFinite(s) || s < 0) return '0m 00s';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}m ${String(sec).padStart(2, '0')}s`;
}

export function TextAudioPlayer({ textId }: Props) {
    const [url, setUrl] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speed, setSpeed] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const speedRef = useRef(1);

    useEffect(() => {
        return () => {
            audioRef.current?.pause();
        };
    }, []);

    useEffect(() => {
        if (!url) return;
        const audio = new Audio(url);
        audio.playbackRate = speedRef.current;
        audioRef.current = audio;
        setIsReady(true);

        const onMeta = () => setDuration(audio.duration);
        const onTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', onMeta);
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        audio.play().catch(() => undefined);

        return () => {
            audio.pause();
            setIsReady(false);
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.src = '';
        };
    }, [url]);

    const handlePlayPause = async () => {
        if (isFetching) return;

        if (!audioRef.current) {
            setIsFetching(true);
            try {
                const fetched = await audioService.downloadAudio(
                    'texts/audio',
                    `${textId}.mp3`,
                );
                setUrl(fetched);
            } catch (err) {
                if (err instanceof AudioNotFoundError) setNotFound(true);
            } finally {
                setIsFetching(false);
            }
            return;
        }

        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play().catch(() => undefined);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const a = audioRef.current;
        if (!a) return;
        const t = Number(e.target.value);
        a.currentTime = t;
        setCurrentTime(t);
    };

    const skip = (secs: number) => {
        const a = audioRef.current;
        if (!a) return;
        a.currentTime = Math.max(0, Math.min(duration, a.currentTime + secs));
    };

    const handleSpeed = (s: number) => {
        speedRef.current = s;
        setSpeed(s);
        if (audioRef.current) audioRef.current.playbackRate = s;
    };

    if (notFound) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={styles.player}>
            <div className={styles.sliderRow}>
                <input
                    aria-label="Audio progress"
                    className={styles.slider}
                    disabled={!isReady}
                    max={duration || 100}
                    min={0}
                    onChange={handleSeek}
                    step={0.1}
                    style={{ '--p': `${progress}%` } as React.CSSProperties}
                    type="range"
                    value={currentTime}
                />
                <div className={styles.times}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{duration > 0 ? formatTime(duration) : '--'}</span>
                </div>
            </div>

            <div className={styles.controls}>
                <button
                    aria-label="Rewind 10 seconds"
                    className={styles.skipBtn}
                    disabled={!isReady}
                    onClick={() => skip(-10)}
                    type="button"
                >
                    <svg
                        aria-hidden="true"
                        fill="currentColor"
                        height="22"
                        viewBox="0 0 24 24"
                        width="22"
                    >
                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    </svg>
                    <span className={styles.skipLabel}>10s</span>
                </button>

                <button
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className={styles.playBtn}
                    disabled={isFetching}
                    onClick={() => void handlePlayPause()}
                    type="button"
                >
                    {isFetching ? (
                        <span aria-hidden="true" className={styles.spinner} />
                    ) : isPlaying ? (
                        <svg
                            aria-hidden="true"
                            fill="currentColor"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                        >
                            <rect height="16" rx="1" width="4" x="6" y="4" />
                            <rect height="16" rx="1" width="4" x="14" y="4" />
                        </svg>
                    ) : (
                        <svg
                            aria-hidden="true"
                            fill="currentColor"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                <button
                    aria-label="Skip forward 10 seconds"
                    className={styles.skipBtn}
                    disabled={!isReady}
                    onClick={() => skip(10)}
                    type="button"
                >
                    <svg
                        aria-hidden="true"
                        fill="currentColor"
                        height="22"
                        viewBox="0 0 24 24"
                        width="22"
                    >
                        <g transform="scale(-1,1) translate(-24,0)">
                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </g>
                    </svg>
                    <span className={styles.skipLabel}>10s</span>
                </button>
            </div>

            <div className={styles.speedRow}>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                        aria-label={`Set speed to ${s}x`}
                        aria-pressed={speed === s}
                        className={`${styles.speedBtn} ${speed === s ? styles.speedBtnActive : ''}`}
                        disabled={!isReady}
                        key={s}
                        onClick={() => handleSpeed(s)}
                        type="button"
                    >
                        {s}x
                    </button>
                ))}
            </div>
        </div>
    );
}
