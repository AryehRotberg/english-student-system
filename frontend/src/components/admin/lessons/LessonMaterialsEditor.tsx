import { useRef, useState } from 'react';
import {
    useInvalidateLesson,
    useRemoveLessonMaterial,
    useReorderLessonMaterials,
} from '../../../hooks/mutations';
import styles from '../../../pages/Admin/AdminPage.module.css';
import {
    LESSON_MATERIAL_ACCEPT,
    MAX_MATERIALS_PER_LESSON,
    lessonMaterialType,
    lessonsService,
} from '../../../services/lessons.service';
import type { Lesson } from '../../../types/lesson';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { LessonMaterialViewer } from '../../lessons/LessonMaterialViewer';

const MB = 1024 * 1024;
const MAX_BYTES: Record<string, number> = {
    'application/pdf': 25 * MB,
    'text/html': 5 * MB,
};

type Upload = { name: string; progress: number };

function formatSize(bytes: number) {
    return bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

// "Session 1 - slides.pdf" -> "Session 1 - slides"
function titleFromFileName(name: string) {
    return name.replace(/\.[^.]+$/, '').trim() || name;
}

export function LessonMaterialsEditor({ lesson }: { lesson: Lesson }) {
    const invalidateLesson = useInvalidateLesson();
    const reorder = useReorderLessonMaterials();
    const removeMaterial = useRemoveLessonMaterial();
    const inputRef = useRef<HTMLInputElement>(null);
    const [upload, setUpload] = useState<Upload | null>(null);
    const [problems, setProblems] = useState<string[]>([]);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const materials = lesson.materials;
    const error = reorder.error ?? removeMaterial.error;

    const handleFiles = async (list: FileList | null) => {
        if (!list || list.length === 0) return;
        const found: string[] = [];
        const accepted: File[] = [];
        let slots = MAX_MATERIALS_PER_LESSON - materials.length;

        for (const file of Array.from(list)) {
            const type = lessonMaterialType(file);
            if (!type) {
                found.push(`${file.name}: only PDF and HTML files can be added.`);
            } else if (file.size > MAX_BYTES[type]) {
                found.push(
                    `${file.name}: larger than ${MAX_BYTES[type] / MB} MB.`,
                );
            } else if (slots <= 0) {
                found.push(
                    `A lesson can have at most ${MAX_MATERIALS_PER_LESSON} files.`,
                );
                break;
            } else {
                accepted.push(file);
                slots--;
            }
        }

        // One at a time keeps the file order equal to the selection order.
        for (const file of accepted) {
            setUpload({ name: file.name, progress: 0 });
            try {
                await lessonsService.uploadMaterial(
                    lesson.id,
                    file,
                    titleFromFileName(file.name),
                    (progress) => setUpload({ name: file.name, progress }),
                );
            } catch (uploadError) {
                found.push(`${file.name}: ${getApiErrorMessage(uploadError)}`);
            }
        }

        setUpload(null);
        setProblems(found);
        if (inputRef.current) inputRef.current.value = '';
        await invalidateLesson(lesson.id);
    };

    const move = (index: number, delta: number) => {
        const ids = materials.map((m) => m.id);
        const [moved] = ids.splice(index, 1);
        ids.splice(index + delta, 0, moved);
        reorder.mutate({ lessonId: lesson.id, materialIds: ids });
    };

    return (
        <div className={styles.subSection}>
            <h4>Lesson files</h4>
            <p className={styles.hintText}>
                PDF slide decks (up to 25 MB) and standalone HTML pages (up to 5
                MB). HTML pages run in a sandbox: their scripts work, but they
                cannot reach the student's account. Students see the files in
                this order.
            </p>

            <ul className={styles.subList}>
                {materials.map((material, index) => (
                    <li key={material.id} className={styles.subItem}>
                        <div className={styles.subItemRow}>
                            <span dir="auto">
                                <strong>{material.title}</strong>{' '}
                                ({material.kind === 'html' ? 'HTML' : 'PDF'} ·{' '}
                                {formatSize(material.sizeBytes)})
                            </span>
                            <button
                                type="button"
                                className={styles.editBtn}
                                disabled={index === 0 || reorder.isPending}
                                onClick={() => move(index, -1)}
                                aria-label={`Move ${material.title} up`}
                            >
                                ↑
                            </button>
                            <button
                                type="button"
                                className={styles.editBtn}
                                disabled={
                                    index === materials.length - 1 ||
                                    reorder.isPending
                                }
                                onClick={() => move(index, 1)}
                                aria-label={`Move ${material.title} down`}
                            >
                                ↓
                            </button>
                            <button
                                type="button"
                                className={styles.editBtn}
                                onClick={() =>
                                    setPreviewId((current) =>
                                        current === material.id ? null : material.id,
                                    )
                                }
                            >
                                {previewId === material.id ? 'Hide preview' : 'Preview'}
                            </button>
                            <button
                                type="button"
                                className={styles.deleteBtn}
                                disabled={removeMaterial.isPending}
                                onClick={() => {
                                    if (!confirm(`Remove "${material.title}"?`)) return;
                                    removeMaterial.mutate({
                                        lessonId: lesson.id,
                                        materialId: material.id,
                                    });
                                }}
                            >
                                Remove
                            </button>
                        </div>
                        {previewId === material.id && (
                            <LessonMaterialViewer material={material} />
                        )}
                    </li>
                ))}
                {materials.length === 0 && (
                    <li className={styles.empty}>No files yet.</li>
                )}
            </ul>

            <div className={styles.field}>
                <label htmlFor={`lesson-files-${lesson.id}`}>Add files</label>
                <input
                    id={`lesson-files-${lesson.id}`}
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={LESSON_MATERIAL_ACCEPT}
                    disabled={Boolean(upload)}
                    onChange={(e) => void handleFiles(e.target.files)}
                />
            </div>
            {upload && (
                <p className={styles.hintText}>
                    Uploading {upload.name}… {Math.round(upload.progress * 100)}%
                </p>
            )}
            {problems.map((problem) => (
                <p key={problem} className={styles.error}>
                    {problem}
                </p>
            ))}
            {error && <p className={styles.error}>{getApiErrorMessage(error)}</p>}
        </div>
    );
}
