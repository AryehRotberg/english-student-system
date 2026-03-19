import { ReadingLibrary } from "../../components/reading/ReadingLibrary";
import { useReadingLibrary } from "../../hooks/queries";
import styles from "./ReadingPage.module.css";

export function ReadingPage() {
    const { data = [] } = useReadingLibrary();

    return (
        <div className={styles.stack}>
            <ReadingLibrary items={data} />
        </div>
    );
}
