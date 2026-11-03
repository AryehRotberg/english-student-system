import type { ReactNode, SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
    size?: number;
};

/** Stroke icons for the app's surfaces; decorative unless labelled. */
function Icon({
    size = 18,
    strokeWidth = 1.75,
    children,
    ...rest
}: IconProps & { children: ReactNode }) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...rest}
        >
            {children}
        </svg>
    );
}

export function HomeIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9v11h5v-6h4v6h5V9" />
        </Icon>
    );
}

export function ClipboardIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4V3h6v1" />
            <path d="M9 11h6" />
            <path d="M9 15h4" />
        </Icon>
    );
}

export function BookIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5z" />
            <path d="M12 6v13.5" />
        </Icon>
    );
}

export function LettersIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="m3 19 5-14 5 14" />
            <path d="M5 14h6" />
            <path d="M15 9h6" />
            <path d="M15 14h6" />
            <path d="M15 19h4" />
        </Icon>
    );
}

export function ChecklistIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="m8 9 1.5 1.5L12 8" />
            <path d="M14 9.5h3" />
            <path d="m8 15 1.5 1.5L12 14" />
            <path d="M14 15.5h3" />
        </Icon>
    );
}

export function PenIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 20h4L19 9l-4-4L4 16z" />
            <path d="m13.5 6.5 4 4" />
        </Icon>
    );
}

export function ScreenIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="4" width="18" height="13" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
        </Icon>
    );
}

export function CardsIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="7" width="13" height="14" rx="2" />
            <path d="M8 3h11a2 2 0 0 1 2 2v12" />
        </Icon>
    );
}

export function HeadphonesIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <rect x="3" y="15" width="4" height="6" rx="1.5" />
            <rect x="17" y="15" width="4" height="6" rx="1.5" />
        </Icon>
    );
}

export function ClockIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </Icon>
    );
}

export function UserIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </Icon>
    );
}

export function CheckIcon(props: IconProps) {
    return (
        <Icon strokeWidth={2.25} {...props}>
            <path d="m5 12 5 5 9-10" />
        </Icon>
    );
}

export function CalendarIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="4.5" width="18" height="16" rx="2" />
            <path d="M3 9.5h18" />
            <path d="M8 2.5v4" />
            <path d="M16 2.5v4" />
        </Icon>
    );
}

export function SearchIcon(props: IconProps) {
    return (
        <Icon strokeWidth={2} {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </Icon>
    );
}

export function PlusIcon(props: IconProps) {
    return (
        <Icon strokeWidth={2} {...props}>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </Icon>
    );
}

export function ChevronDownIcon(props: IconProps) {
    return (
        <Icon strokeWidth={2} {...props}>
            <path d="m6 9 6 6 6-6" />
        </Icon>
    );
}

/** Points to the reading direction's "forward"; flipped in RTL by the caller. */
export function ChevronForwardIcon(props: IconProps) {
    return (
        <Icon strokeWidth={2} {...props}>
            <path d="m9 6 6 6-6 6" />
        </Icon>
    );
}

export function ArrowForwardIcon(props: IconProps) {
    return (
        <Icon strokeWidth={2} {...props}>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </Icon>
    );
}

export function DotsIcon(props: IconProps) {
    return (
        <Icon stroke="none" fill="currentColor" {...props}>
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
        </Icon>
    );
}

export function ShieldIcon(props: IconProps) {
    return (
        <Icon strokeWidth={2.25} {...props}>
            <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" />
        </Icon>
    );
}

export function GlobeIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
        </Icon>
    );
}

export function ListIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h10" />
        </Icon>
    );
}

export function MenuIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
        </Icon>
    );
}

export function CloseIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
        </Icon>
    );
}

export function MailIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </Icon>
    );
}

export function LockIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </Icon>
    );
}

export function EyeIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </Icon>
    );
}

export function EyeOffIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2" />
            <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            <path d="m3 3 18 18" />
        </Icon>
    );
}

/**
 * The Waypoint logo: the four-pointed star that marks a waypoint on flight
 * charts, inside a ring. Drawn in currentColor; the centre is cut out.
 */
export function WaypointMark({
    size = 24,
    className,
}: {
    size?: number;
    className?: string;
}) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12"
                cy="12"
                r="6.6"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.55"
            />
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M12 2.5Q13.1 10.9 21.5 12Q13.1 13.1 12 21.5Q10.9 13.1 2.5 12Q10.9 10.9 12 2.5ZM12 10.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3Z"
            />
        </svg>
    );
}

/** Concentric rings drawn in the corner of the hero banners. */
export function HeroRings({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            className={className}
            width="340"
            height="340"
            viewBox="0 0 340 340"
            fill="none"
        >
            <circle cx="170" cy="170" r="70" stroke="#ffffff" strokeWidth="2" />
            <circle cx="170" cy="170" r="115" stroke="#ffffff" strokeWidth="2" />
            <circle cx="170" cy="170" r="160" stroke="#ffffff" strokeWidth="2" />
        </svg>
    );
}
