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

export type Receipt = {
    id: string;
    studentId: string;
    studentName: string | null;
    amount: number;
    paymentMethod: PaymentMethod;
    documentDate: string;
    morningDocumentNumber: string | null;
    emailedTo: string | null;
    createdAt: string;
};

export type MorningClient = {
    id: string;
    name: string;
    emails: string[];
};
