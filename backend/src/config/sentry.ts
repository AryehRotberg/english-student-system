import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: 'https://89c21aea5c2fac325d804f88eae1a6d2@o4510205924999168.ingest.de.sentry.io/4511044544692304',
    sendDefaultPii: true,
});

export default Sentry;