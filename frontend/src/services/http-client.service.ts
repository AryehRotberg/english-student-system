import axios, { type AxiosInstance } from 'axios';
import Sentry from '../config/sentry';

class HttpClientService {
    private readonly API_BASE_URL: string;
    private instance: AxiosInstance;

    constructor() {
        this.API_BASE_URL = import.meta.env.PROD
            ? '/api'
            : 'http://localhost:3000';

        this.instance = axios.create(this.getAxiosConfig());
        this.setupInterceptors();
    }

    public getInstance(): AxiosInstance {
        return this.instance;
    }

    private getAxiosConfig() {
        return {
            baseURL: this.API_BASE_URL,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    private setupInterceptors() {
        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                this.handleError(error, 'httpRequest');
                return Promise.reject(error);
            }
        );
    }

    private handleError(error: unknown, tag: string, extra: Record<string, any> = {}) {
        if (axios.isAxiosError(error)) {
            Sentry.captureException(error, {
                tags: { api_call: tag, error_type: 'network' },
                extra: {
                    status: error.response?.status,
                    url: error.config?.url,
                    ...extra
                }
            });
        } else {
            Sentry.captureException(error);
        }
    }
}

export const httpClientService = new HttpClientService();