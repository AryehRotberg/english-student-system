export type PaymentMethod = 'bit' | 'cash';

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'bit', label: 'Bit' },
    { value: 'cash', label: 'Cash' },
];

export function methodLabel(method: PaymentMethod): string {
    return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

export function formatShekels(amount: number): string {
    return `₪${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

/** dd/mm/yyyy from an ISO date (yyyy-mm-dd). */
export function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

/** Today's date in the browser's time zone, as yyyy-mm-dd (what <input type="date"> uses). */
export function todayIso(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export type Receipt = {
    id: string;
    studentId: string;
    studentName: string | null;
    amount: number;
    paymentMethod: PaymentMethod;
    documentDate: string;
    paymentDate: string;
    morningDocumentNumber: string | null;
    emailedTo: string | null;
    createdAt: string;
};

export type MorningClient = {
    id: string;
    name: string;
    emails: string[];
};
