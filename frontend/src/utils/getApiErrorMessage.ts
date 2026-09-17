import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const data = error.response?.data as
            | { message?: string; detail?: string; title?: string }
            | undefined;
        return data?.message ?? data?.detail ?? data?.title ?? error.message;
    }

    return error instanceof Error ? error.message : 'Something went wrong.';
}
