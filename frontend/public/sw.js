self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(
            data.title ?? 'English Student System',
            {
                body: data.body ?? '',
                icon: '/open-book.png',
            },
        ),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if ('focus' in client) {
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow('/');
                }
            }),
    );
});
