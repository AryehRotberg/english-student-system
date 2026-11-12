import { useMemo } from 'react';
import type { Topic } from '../../types/subject';
import { topicOptions } from '../../utils/topics';
import { SearchSelect } from './SearchSelect';

type Props = {
    id: string;
    topics: Topic[];
    value: string;
    onChange: (topicId: string) => void;
    required?: boolean;
};

/** A subject's topic tree in a searchable dropdown. */
export function TopicPicker({ id, topics, value, onChange, required }: Props) {
    const options = useMemo(() => topicOptions(topics), [topics]);
    return (
        <SearchSelect
            id={id}
            options={options}
            value={value}
            onChange={onChange}
            required={required}
            placeholder="Type to search topics…"
        />
    );
}
