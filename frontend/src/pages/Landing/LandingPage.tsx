import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import {
    ArrowForwardIcon,
    BellIcon,
    CheckIcon,
    CodeIcon,
    CopyIcon,
    GlobeIcon,
    HeroRings,
    LayersIcon,
    LettersIcon,
    MailIcon,
    PenIcon,
    ShieldIcon,
    SigmaIcon,
    SparkIcon,
    WaypointMark,
    WaypointWordmark,
} from '../../components/hub/icons';
import type { UiLanguage } from '../../types/subject';
import { AppPreview } from './AppPreview';
import styles from './LandingPage.module.css';

const CONTACT_EMAIL = 'contact.roaryeh@gmail.com';

type IconComponent = ComponentType<{ size?: number }>;

const SUBJECTS: { id: string; icon: IconComponent; points: string[] }[] = [
    { id: 'english', icon: LettersIcon, points: ['p1', 'p2', 'p3'] },
    { id: 'math', icon: SigmaIcon, points: ['p1', 'p2', 'p3'] },
    { id: 'cs', icon: CodeIcon, points: ['p1', 'p2', 'p3'] },
    { id: 'se', icon: LayersIcon, points: ['p1', 'p2', 'p3'] },
    { id: 'ai', icon: SparkIcon, points: ['p1', 'p2', 'p3', 'p4'] },
    { id: 'cyber', icon: ShieldIcon, points: ['p1', 'p2', 'p3', 'p4'] },
];

const FEATURES: { id: string; icon: IconComponent }[] = [
    { id: 'handwritten', icon: PenIcon },
    { id: 'notify', icon: BellIcon },
    { id: 'bilingual', icon: GlobeIcon },
];

function isUiLanguage(value: string | null): value is UiLanguage {
    return value === 'en' || value === 'he';
}

/**
 * The public page that markets the tutoring. `?lang=en|he` picks the
 * language, so a link can open straight in Hebrew.
 */
export function LandingPage() {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const requested = searchParams.get('lang');

    // Re-applied whenever the language changes, so the link's language also
    // wins over a signed-in user's saved preference loading late.
    useEffect(() => {
        if (isUiLanguage(requested) && i18n.language !== requested) {
            void i18n.changeLanguage(requested);
        }
    }, [requested, i18n, i18n.language]);

    const pageTitle = t('landing.pageTitle');
    useEffect(() => {
        const previous = document.title;
        document.title = pageTitle;
        return () => {
            document.title = previous;
        };
    }, [pageTitle]);

    const nextLanguage: UiLanguage = i18n.language === 'he' ? 'en' : 'he';
    function switchLanguage() {
        setSearchParams(
            (params) => {
                params.set('lang', nextLanguage);
                return params;
            },
            { replace: true },
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <HeroRings className={styles.rings} />
                <div className={styles.glowMark} aria-hidden="true">
                    <WaypointMark size={520} />
                </div>

                <div className={styles.topBar}>
                    <a href="#top" className={styles.brand} aria-label={t('app.name')}>
                        <WaypointMark size={30} className={styles.brandMark} />
                    </a>
                    <nav className={styles.sectionNav} aria-label={t('landing.nav.label')}>
                        <a href="#subjects">{t('landing.nav.subjects')}</a>
                        <a href="#platform">{t('landing.nav.platform')}</a>
                        <a href="#steps">{t('landing.nav.steps')}</a>
                        <a href="#contact">{t('landing.nav.contact')}</a>
                    </nav>
                    <div className={styles.topActions}>
                        <button
                            type="button"
                            className={styles.languageButton}
                            lang={nextLanguage}
                            title={t('language.switchToTitle')}
                            onClick={switchLanguage}
                        >
                            <GlobeIcon size={16} />
                            {t('language.switchTo')}
                        </button>
                        <Link to="/login" className={styles.signInLink}>
                            {t('landing.nav.signIn')}
                        </Link>
                        <Link to="/register" className={styles.registerButton}>
                            {t('landing.nav.register')}
                        </Link>
                    </div>
                </div>

                <div className={styles.heroBody} id="top">
                    <WaypointWordmark
                        width={560}
                        className={styles.wordmark}
                        title={t('app.name')}
                    />
                    <p className={styles.eyebrowLight}>{t('landing.hero.eyebrow')}</p>
                    <h1 className={styles.heroTitle}>
                        {t('landing.hero.title')}{' '}
                        <span className={styles.heroHighlight}>
                            {t('landing.hero.titleHighlight')}
                        </span>
                    </h1>
                    <p className={styles.heroSubtitle}>{t('landing.hero.subtitle')}</p>
                    <div className={styles.heroActions}>
                        <Link to="/register" className={styles.primaryCta}>
                            {t('landing.hero.register')}
                            <ArrowForwardIcon size={18} className={styles.flipRtl} />
                        </Link>
                        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.ghostCta}>
                            <MailIcon size={18} />
                            {t('landing.hero.email')}
                        </a>
                    </div>
                    <p className={styles.heroSignIn}>
                        {t('landing.hero.haveAccount')}{' '}
                        <Link to="/login">{t('landing.hero.signIn')}</Link>
                    </p>
                    <ul className={styles.chips}>
                        {SUBJECTS.map(({ id, icon: Icon }) => (
                            <li key={id}>
                                <a href={`#subject-${id}`} className={styles.chip}>
                                    <Icon size={16} />
                                    {t(`landing.subjects.${id}.name`)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </header>

            <main>
                <section id="subjects" className={styles.section} aria-labelledby="subjects-title">
                    <SectionHeading
                        id="subjects-title"
                        eyebrow={t('landing.subjects.eyebrow')}
                        title={t('landing.subjects.title')}
                        subtitle={t('landing.subjects.subtitle')}
                    />
                    <ul className={styles.subjectGrid}>
                        {SUBJECTS.map(({ id, icon: Icon, points }) => (
                            <li key={id} id={`subject-${id}`} className={styles.subjectCard}>
                                <div className={styles.subjectHead}>
                                    <span className={styles.subjectIcon}>
                                        <Icon size={22} />
                                    </span>
                                    <span className={styles.subjectTag}>
                                        {t(`landing.subjects.${id}.tag`)}
                                    </span>
                                </div>
                                <h3 className={styles.subjectName}>
                                    {t(`landing.subjects.${id}.name`)}
                                </h3>
                                <p className={styles.subjectDescription}>
                                    {t(`landing.subjects.${id}.description`)}
                                </p>
                                <ul className={styles.points}>
                                    {points.map((point) => (
                                        <li key={point}>
                                            <CheckIcon size={16} className={styles.pointIcon} />
                                            {t(`landing.subjects.${id}.${point}`)}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </section>

                <section
                    id="platform"
                    className={`${styles.section} ${styles.sectionTinted}`}
                    aria-labelledby="platform-title"
                >
                    <SectionHeading
                        id="platform-title"
                        eyebrow={t('landing.platform.eyebrow')}
                        title={t('landing.platform.title')}
                        subtitle={t('landing.platform.subtitle')}
                    />
                    <AppPreview />
                    <ul className={styles.features}>
                        {FEATURES.map(({ id, icon: Icon }) => (
                            <li key={id} className={styles.feature}>
                                <span className={styles.featureIcon}>
                                    <Icon size={20} />
                                </span>
                                <div>
                                    <h3 className={styles.featureTitle}>
                                        {t(`landing.platform.features.${id}Title`)}
                                    </h3>
                                    <p className={styles.featureText}>
                                        {t(`landing.platform.features.${id}`)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section id="steps" className={styles.section} aria-labelledby="steps-title">
                    <SectionHeading
                        id="steps-title"
                        eyebrow={t('landing.steps.eyebrow')}
                        title={t('landing.steps.title')}
                    />
                    <ol className={styles.steps}>
                        {(['s1', 's2', 's3'] as const).map((step, index) => (
                            <li key={step} className={styles.step}>
                                <span className={styles.stepNumber}>{index + 1}</span>
                                <h3 className={styles.stepTitle}>
                                    {t(`landing.steps.${step}Title`)}
                                </h3>
                                <p className={styles.stepText}>{t(`landing.steps.${step}`)}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="contact" className={styles.contactSection} aria-labelledby="contact-title">
                    <ContactBand />
                </section>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <WaypointWordmark width={160} title={t('app.name')} />
                        <p>{t('landing.footer.tagline')}</p>
                    </div>
                    <div className={styles.footerLinks}>
                        <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr">
                            {CONTACT_EMAIL}
                        </a>
                        <Link to="/register">{t('landing.nav.register')}</Link>
                        <Link to="/login">{t('landing.nav.signIn')}</Link>
                    </div>
                </div>
                <p className={styles.copyright}>
                    {t('landing.footer.rights', { year: new Date().getFullYear() })}
                </p>
            </footer>
        </div>
    );
}

function SectionHeading({
    id,
    eyebrow,
    title,
    subtitle,
}: {
    id: string;
    eyebrow: string;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id={id} className={styles.sectionTitle}>
                {title}
            </h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
        </div>
    );
}

function ContactBand() {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    async function copyEmail() {
        try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            setCopied(true);
        } catch {
            // Clipboard access can be denied; the address is on screen anyway.
        }
    }

    return (
        <div className={styles.contactBand}>
            <HeroRings className={styles.contactRings} />
            <h2 id="contact-title" className={styles.contactTitle}>
                {t('landing.contact.title')}
            </h2>
            <p className={styles.contactSubtitle}>{t('landing.contact.subtitle')}</p>
            <div className={styles.emailRow}>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.emailLink} dir="ltr">
                    <MailIcon size={18} />
                    {CONTACT_EMAIL}
                </a>
                <button
                    type="button"
                    className={styles.copyButton}
                    onClick={() => void copyEmail()}
                    aria-label={t('landing.contact.copy')}
                    title={t('landing.contact.copy')}
                >
                    {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                </button>
                <span className={styles.copiedNote} role="status">
                    {copied ? t('landing.contact.copied') : ''}
                </span>
            </div>
            <Link to="/register" className={styles.primaryCta}>
                {t('landing.contact.register')}
                <ArrowForwardIcon size={18} className={styles.flipRtl} />
            </Link>
        </div>
    );
}
