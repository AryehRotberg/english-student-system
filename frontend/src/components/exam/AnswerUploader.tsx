import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useRemoveAnswerFile,
    useReorderAnswerFiles,
} from '../../hooks/mutations';
import {
    answerFilesService,
    MAX_FILES_PER_ANSWER,
    type AnswerFile,
} from '../../services/answer-files.service';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import {
    ACCEPTED_SOURCE_TYPES,
    checkSourceFile,
    localId,
    MAX_UPLOAD_BYTES,
    prepareForUpload,
} from '../../utils/upload-files';
import { AnswerFileGallery } from './AnswerFileGallery';
import styles from './AnswerUploader.module.css';

type Props = {
    attemptId: string;
    questionId: string;
    files: AnswerFile[];
    disabled?: boolean;
};

type PendingUpload = {
    id: string;
    name: string;
    status: 'preparing' | 'uploading' | 'failed';
    progress: number;
    error?: string;
    source: File;
};

const MAX_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

/** Photos/PDF pages of one handwritten answer: add, reorder, remove. */
export function AnswerUploader({
    attemptId,
    questionId,
    files,
    disabled = false,
}: Props) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const removeFile = useRemoveAnswerFile();
    const reorderFiles = useReorderAnswerFiles();
    const pickerRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);
    const [pending, setPending] = useState<PendingUpload[]>([]);
    const [problems, setProblems] = useState<string[]>([]);

    const isBusy = pending.some((p) => p.status !== 'failed');
    const remainingSlots =
        MAX_FILES_PER_ANSWER -
        files.length -
        pending.filter((p) => p.status !== 'failed').length;

    const update = (id: string, patch: Partial<PendingUpload>) =>
        setPending((current) =>
            current.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        );

    const uploadOne = async (item: PendingUpload) => {
        try {
            update(item.id, { status: 'preparing', error: undefined });
            const blob = await prepareForUpload(item.source);

            update(item.id, { status: 'uploading', progress: 0 });
            await answerFilesService.upload(
                attemptId,
                questionId,
                blob,
                (fraction) => update(item.id, { progress: fraction }),
            );

            setPending((current) => current.filter((p) => p.id !== item.id));
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['answer-files', attemptId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['student-answers', attemptId],
                }),
            ]);
        } catch (error) {
            update(item.id, {
                status: 'failed',
                error: getApiErrorMessage(error),
            });
        }
    };

    const handleSelected = async (list: FileList | null) => {
        if (!list || list.length === 0) {
            return;
        }

        const selected = Array.from(list);
        const found: string[] = [];
        const accepted: PendingUpload[] = [];

        for (const file of selected) {
            const problem = checkSourceFile(file);

            if (problem?.kind === 'unsupported') {
                found.push(t('uploader.unsupported', { name: file.name }));
            } else if (problem?.kind === 'tooLarge') {
                found.push(
                    t('uploader.tooLarge', { name: file.name, maxMb: MAX_MB }),
                );
            } else if (accepted.length >= remainingSlots) {
                found.push(
                    t('uploader.tooMany', { max: MAX_FILES_PER_ANSWER }),
                );
                break;
            } else {
                accepted.push({
                    id: localId(),
                    name: file.name,
                    status: 'preparing',
                    progress: 0,
                    source: file,
                });
            }
        }

        setProblems(found);
        setPending((current) => [...current, ...accepted]);

        // One at a time keeps page order equal to selection order.
        for (const item of accepted) {
            await uploadOne(item);
        }
    };

    const move = (index: number, delta: -1 | 1) => {
        const ids = files.map((f) => f.id);
        const target = index + delta;

        if (target < 0 || target >= ids.length) {
            return;
        }

        [ids[index], ids[target]] = [ids[target], ids[index]];
        reorderFiles.mutate({ attemptId, questionId, fileIds: ids });
    };

    const mutationError = removeFile.error ?? reorderFiles.error;

    return (
        <div className={styles.uploader}>
            <AnswerFileGallery
                files={files}
                onRemove={
                    disabled
                        ? undefined
                        : (file) =>
                              removeFile.mutate({ id: file.id, attemptId })
                }
                onMove={disabled ? undefined : move}
                isBusy={removeFile.isPending || reorderFiles.isPending}
            />

            {files.length === 0 && pending.length === 0 && (
                <p className={styles.empty}>{t('uploader.noFiles')}</p>
            )}

            {pending.length > 0 && (
                <ul className={styles.pendingList}>
                    {pending.map((item) => (
                        <li key={item.id} className={styles.pendingItem}>
                            <span className={styles.pendingName} dir="auto">
                                {item.name}
                            </span>
                            {item.status === 'failed' ? (
                                <>
                                    <span className={styles.failed}>
                                        {t('uploader.failed')}
                                        {item.error ? `: ${item.error}` : ''}
                                    </span>
                                    <button
                                        type="button"
                                        className={styles.linkButton}
                                        onClick={() => void uploadOne(item)}
                                    >
                                        {t('common.retry')}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.linkButton}
                                        onClick={() =>
                                            setPending((current) =>
                                                current.filter(
                                                    (p) => p.id !== item.id,
                                                ),
                                            )
                                        }
                                    >
                                        {t('common.remove')}
                                    </button>
                                </>
                            ) : (
                                <span className={styles.progress}>
                                    {item.status === 'preparing'
                                        ? t('uploader.preparing')
                                        : t('uploader.uploading', {
                                              percent: Math.round(
                                                  item.progress * 100,
                                              ),
                                          })}
                                    <span
                                        className={styles.progressBar}
                                        style={{
                                            inlineSize: `${Math.round(item.progress * 100)}%`,
                                        }}
                                    />
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {disabled ? (
                <p className={styles.hint}>{t('uploader.locked')}</p>
            ) : (
                <>
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            disabled={remainingSlots <= 0}
                            onClick={() => pickerRef.current?.click()}
                        >
                            {t('uploader.addFiles')}
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            disabled={remainingSlots <= 0}
                            onClick={() => cameraRef.current?.click()}
                        >
                            {t('uploader.takePhoto')}
                        </button>
                    </div>
                    <p className={styles.hint}>
                        {t('uploader.dropHint', {
                            maxMb: MAX_MB,
                            max: MAX_FILES_PER_ANSWER,
                        })}
                    </p>
                    <input
                        ref={pickerRef}
                        className={styles.hiddenInput}
                        type="file"
                        multiple
                        accept={ACCEPTED_SOURCE_TYPES.join(',')}
                        onChange={(event) => {
                            void handleSelected(event.target.files);
                            event.target.value = '';
                        }}
                    />
                    <input
                        ref={cameraRef}
                        className={styles.hiddenInput}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(event) => {
                            void handleSelected(event.target.files);
                            event.target.value = '';
                        }}
                    />
                </>
            )}

            {problems.map((problem) => (
                <p key={problem} className={styles.error} dir="auto">
                    {problem}
                </p>
            ))}
            {mutationError && (
                <p className={styles.error}>
                    {getApiErrorMessage(mutationError)}
                </p>
            )}
            {isBusy && <span className={styles.srOnly} aria-live="polite" />}
        </div>
    );
}
