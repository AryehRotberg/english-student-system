import { pushSubscriptionsService } from '../services/push-subscriptions.service';

const SERVICE_WORKER_URL = '/sw.js';

export function isPushSupported(): boolean {
    return (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

// Browser PushManager subscription state is the source of truth - no
// separate enabled/disabled flag is stored client-side or server-side.
export async function getPushSubscriptionStatus(): Promise<boolean> {
    if (!isPushSupported()) {
        return false;
    }

    const registration =
        await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);
    const subscription = await registration?.pushManager.getSubscription();

    return Boolean(subscription);
}

export async function enablePushNotifications(): Promise<void> {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
        throw new Error('Notification permission was not granted');
    }

    const registration =
        await navigator.serviceWorker.register(SERVICE_WORKER_URL);
    const publicKey = await pushSubscriptionsService.getVapidPublicKey();

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = subscription.toJSON();

    await pushSubscriptionsService.subscribe({
        endpoint: json.endpoint!,
        keys: {
            p256dh: json.keys!.p256dh,
            auth: json.keys!.auth,
        },
    });
}

export async function disablePushNotifications(): Promise<void> {
    const registration =
        await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);
    const subscription = await registration?.pushManager.getSubscription();

    if (!subscription) {
        return;
    }

    await subscription.unsubscribe();
    await pushSubscriptionsService.unsubscribe(subscription.endpoint);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
