import axios, { type AxiosInstance } from 'axios';
import type {
    Lesson,
    LessonMaterial,
    LessonSummary,
    SaveLessonPayload,
} from '../types/lesson';
import { putToSignedUrl, type SignedUpload } from './answer-files.service';
import { httpClientService } from './http-client.service';

export const LESSON_MATERIAL_TYPES: Record<string, string> = {
    pdf: 'application/pdf',
    html: 'text/html',
    htm: 'text/html',
};
export const LESSON_MATERIAL_ACCEPT = '.pdf,.html,.htm,application/pdf,text/html';
export const MAX_MATERIALS_PER_LESSON = 20;

// Browsers report .html files inconsistently (sometimes as an empty type), so the
// type comes from the extension. The API checks the real bytes either way.
export function lessonMaterialType(file: File): string | null {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    return LESSON_MATERIAL_TYPES[extension] ?? null;
}

class LessonsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll(filters: {
        subjectId?: string;
        topicId?: string;
    }): Promise<LessonSummary[]> {
        const response = await this.httpClient.get<LessonSummary[]>(
            '/study-guides',
            { params: filters },
        );
        return response.data;
    }

    public async findById(id: string): Promise<Lesson> {
        const response = await this.httpClient.get<Lesson>(
            `/study-guides/${id}`,
        );
        return response.data;
    }

    public async create(payload: SaveLessonPayload): Promise<Lesson> {
        const response = await this.httpClient.post<Lesson>(
            '/study-guides',
            payload,
        );
        return response.data;
    }

    public async update(id: string, payload: SaveLessonPayload): Promise<Lesson> {
        const response = await this.httpClient.put<Lesson>(
            `/study-guides/${id}`,
            payload,
        );
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/study-guides/${id}`);
    }

    // Upload URL -> direct PUT to storage -> confirm (the API checks the bytes).
    public async uploadMaterial(
        lessonId: string,
        file: File,
        title: string,
        onProgress?: (fraction: number) => void,
    ): Promise<LessonMaterial> {
        const mimeType = lessonMaterialType(file);
        if (!mimeType) {
            throw new Error('Only PDF and HTML files can be added to a lesson.');
        }
        const body = new Blob([file], { type: mimeType });

        const upload = await this.httpClient
            .post<SignedUpload>(`/study-guides/${lessonId}/materials/upload-url`, {
                mimeType,
                sizeBytes: body.size,
            })
            .then((res) => res.data);

        await putToSignedUrl(upload, body, onProgress);

        const response = await this.httpClient.post<LessonMaterial>(
            `/study-guides/${lessonId}/materials`,
            { path: upload.path, title },
        );
        return response.data;
    }

    public async reorderMaterials(
        lessonId: string,
        materialIds: string[],
    ): Promise<void> {
        await this.httpClient.put(`/study-guides/${lessonId}/materials/order`, {
            materialIds,
        });
    }

    public async removeMaterial(lessonId: string, materialId: string) {
        await this.httpClient.delete(
            `/study-guides/${lessonId}/materials/${materialId}`,
        );
    }

    // The page's source, for rendering in a sandboxed iframe. A bare axios call:
    // the signed URL points at storage, not at the API.
    public async fetchHtml(url: string): Promise<string> {
        const response = await axios.get<string>(url, {
            responseType: 'text',
            transformResponse: (data: string) => data,
        });
        return response.data;
    }
}

export const lessonsService = new LessonsService();
