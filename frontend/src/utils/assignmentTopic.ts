import type { AssignmentItemContentType } from '../services/assignments.service';
import type { AssignmentTopic } from '../types/task';

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

const contentTypeLabels: Record<AssignmentItemContentType, string> = {
    quiz: 'Quiz',
    reading: 'Reading',
    vocabulary: 'Vocabulary',
    writing: 'Writing',
};

/**
 * Items may be created without content (the API stores an empty GUID), and the
 * referenced content row can be deleted later. Neither can be navigated to.
 */
export function hasOpenableContent(
    contentId: string | null | undefined,
): boolean {
    return Boolean(contentId) && contentId !== EMPTY_GUID;
}

export function isOpenableTopic(topic: AssignmentTopic): boolean {
    return hasOpenableContent(topic.contentId);
}

export function contentTypeLabel(
    contentType: AssignmentItemContentType,
): string {
    return contentTypeLabels[contentType];
}

/** Falls back to the content type so an item never renders as a blank chip. */
export function topicLabel(topic: AssignmentTopic): string {
    const title = topic.topicTitle?.trim();
    return title ? title : contentTypeLabels[topic.contentType];
}

/** Where a piece of assignment content lives in the app. */
export function assignmentContentRoute(
    contentType: AssignmentItemContentType,
    contentId: string,
): string {
    if (contentType === 'quiz') {
        return `/quiz/${contentId}`;
    }

    if (contentType === 'reading') {
        return `/reading/${contentId}`;
    }

    if (contentType === 'vocabulary') {
        return `/vocab?topicId=${contentId}`;
    }

    return '/practice';
}
