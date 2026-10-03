import type { AxiosInstance } from 'axios';
import type {
    StudentSubject,
    Subject,
    SubjectLevel,
    Topic,
    UiLanguage,
    UserPreferences,
} from '../types/subject';
import { httpClientService } from './http-client.service';

export type SaveTopicPayload = {
    subjectId: string;
    parentId: string | null;
    name: string;
    slug?: string;
    category?: string | null;
    sortOrder: number;
};

class SubjectsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll(): Promise<Subject[]> {
        const response = await this.httpClient.get<Subject[]>('/subjects');
        return response.data;
    }

    public async createLevel(
        subjectId: string,
        payload: { code: string; name: string; sortOrder: number },
    ): Promise<SubjectLevel> {
        const response = await this.httpClient.post<SubjectLevel>(
            `/subjects/${subjectId}/levels`,
            payload,
        );
        return response.data;
    }

    public async removeLevel(levelId: string): Promise<void> {
        await this.httpClient.delete(`/subjects/levels/${levelId}`);
    }

    public async getMyPreferences(): Promise<UserPreferences> {
        const response = await this.httpClient.get<UserPreferences>(
            '/users/me/preferences',
        );
        return response.data;
    }

    public async updateMyPreferences(
        uiLanguage: UiLanguage,
    ): Promise<UserPreferences> {
        const response = await this.httpClient.put<UserPreferences>(
            '/users/me/preferences',
            { uiLanguage },
        );
        return response.data;
    }

    public async findStudentSubjects(
        studentId: string,
    ): Promise<StudentSubject[]> {
        const response = await this.httpClient.get<StudentSubject[]>(
            `/users/${studentId}/subjects`,
        );
        return response.data;
    }

    public async setStudentSubjects(
        studentId: string,
        subjects: { subjectId: string; levelId: string | null }[],
    ): Promise<StudentSubject[]> {
        const response = await this.httpClient.put<StudentSubject[]>(
            `/users/${studentId}/subjects`,
            { subjects },
        );
        return response.data;
    }

    public async findTopics(subjectId?: string): Promise<Topic[]> {
        const response = await this.httpClient.get<Topic[]>('/topics', {
            params: subjectId ? { subjectId } : {},
        });
        return response.data;
    }

    public async createTopic(payload: SaveTopicPayload): Promise<Topic> {
        const response = await this.httpClient.post<Topic>('/topics', payload);
        return response.data;
    }

    public async updateTopic(
        id: string,
        payload: SaveTopicPayload,
    ): Promise<Topic> {
        const response = await this.httpClient.put<Topic>(
            `/topics/${id}`,
            payload,
        );
        return response.data;
    }

    public async removeTopic(id: string): Promise<void> {
        await this.httpClient.delete(`/topics/${id}`);
    }
}

export const subjectsService = new SubjectsService();
