import axios, { type AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';

export type AnswerFile = {
    id: string;
    studentAnswerId: string;
    questionId: string;
    mimeType: string;
    sizeBytes: number;
    pageOrder: number;
    uploadedAt: string;
    // Short-lived signed link; refetch the list when it expires.
    url: string | null;
};

export type SignedUpload = {
    uploadUrl: string;
    path: string;
    maxFileSizeBytes: number;
};

export const ANSWER_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const QUESTION_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILES_PER_ANSWER = 10;

// Puts a file straight into Supabase Storage at a signed upload URL issued by
// the API, so large photos and scans never pass through the backend. Uses a
// bare axios call: the API client's base URL and cookies don't apply here.
export async function putToSignedUrl(
    upload: SignedUpload,
    file: Blob,
    onProgress?: (fraction: number) => void,
): Promise<void> {
    const body = new FormData();
    body.append('cacheControl', '3600');
    body.append('', file);

    await axios.put(upload.uploadUrl, body, {
        headers: { 'x-upsert': 'false' },
        onUploadProgress: (event) => {
            if (onProgress && event.total) {
                onProgress(event.loaded / event.total);
            }
        },
    });
}

class AnswerFilesService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findByAttempt(attemptId: string): Promise<AnswerFile[]> {
        const response = await this.httpClient.get<AnswerFile[]>(
            '/answer-files',
            { params: { attemptId } },
        );
        return response.data;
    }

    // Upload URL -> direct PUT to storage -> confirm (the API checks the bytes).
    public async upload(
        attemptId: string,
        questionId: string,
        file: Blob,
        onProgress?: (fraction: number) => void,
    ): Promise<AnswerFile> {
        const upload = await this.httpClient
            .post<SignedUpload>('/answer-files/upload-url', {
                attemptId,
                questionId,
                mimeType: file.type,
                sizeBytes: file.size,
            })
            .then((res) => res.data);

        await putToSignedUrl(upload, file, onProgress);

        const response = await this.httpClient.post<AnswerFile>(
            '/answer-files',
            { attemptId, questionId, path: upload.path },
        );
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/answer-files/${id}`);
    }

    public async reorder(
        attemptId: string,
        questionId: string,
        fileIds: string[],
    ): Promise<void> {
        await this.httpClient.put('/answer-files/order', {
            attemptId,
            questionId,
            fileIds,
        });
    }

    public async uploadFeedbackFile(answerId: string, file: Blob) {
        const upload = await this.httpClient
            .post<SignedUpload>(
                `/student-answers/${answerId}/feedback-file/upload-url`,
                { mimeType: file.type, sizeBytes: file.size },
            )
            .then((res) => res.data);

        await putToSignedUrl(upload, file);

        const response = await this.httpClient.put(
            `/student-answers/${answerId}/feedback-file`,
            { path: upload.path },
        );
        return response.data;
    }

    public async removeFeedbackFile(answerId: string) {
        const response = await this.httpClient.delete(
            `/student-answers/${answerId}/feedback-file`,
        );
        return response.data;
    }

    public async getFeedbackFileUrl(answerId: string): Promise<string> {
        const response = await this.httpClient.get<{ url: string }>(
            `/student-answers/${answerId}/feedback-file/url`,
        );
        return response.data.url;
    }

    public async getQuestionImageUrl(questionId: string): Promise<string> {
        const response = await this.httpClient.get<{ url: string }>(
            `/questions/${questionId}/image-url`,
        );
        return response.data.url;
    }

    public async uploadQuestionImage(questionId: string, file: Blob) {
        const upload = await this.httpClient
            .post<SignedUpload>(`/questions/${questionId}/image/upload-url`, {
                mimeType: file.type,
                sizeBytes: file.size,
            })
            .then((res) => res.data);

        await putToSignedUrl(upload, file);

        const response = await this.httpClient.put(
            `/questions/${questionId}/image`,
            { path: upload.path },
        );
        return response.data;
    }

    public async removeQuestionImage(questionId: string) {
        const response = await this.httpClient.delete(
            `/questions/${questionId}/image`,
        );
        return response.data;
    }
}

export const answerFilesService = new AnswerFilesService();

export function isNotFound(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 404;
}
