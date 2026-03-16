import { API_BASE_URL } from '../config/api';

type RequestConfig = {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    body?: unknown;
};

async function request<T>({ method, path, body }: RequestConfig): Promise<T> {
    const headers: HeadersInit = {};

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        credentials: 'include',
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            const parsed = JSON.parse(errorText) as { message?: string | string[] };

            if (Array.isArray(parsed.message)) {
                throw new Error(parsed.message.join(', '));
            }

            if (typeof parsed.message === 'string') {
                throw new Error(parsed.message);
            }
        } catch {
            // Fall through to raw text if response body is not JSON.
        }

        throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export const httpClient = {
    get: <T>(path: string) => request<T>({ method: 'GET', path }),
    post: <T>(path: string, body: unknown) => request<T>({ method: 'POST', path, body }),
    patch: <T>(path: string, body: unknown) => request<T>({ method: 'PATCH', path, body }),
    delete: <T>(path: string) => request<T>({ method: 'DELETE', path }),
};
