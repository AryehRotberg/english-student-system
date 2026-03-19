import { PracticeCenter } from "../../components/practice/PracticeCenter";
import styles from "./PracticePage.module.css";

export function PracticePage() {
    return (
        <div className={styles.stack}>
            <PracticeCenter />
            <PracticeCenter />
        </div>
    );
}
