import * as Sentry from '@sentry/react';

Sentry.init({
    dsn: 'https://89089dab1c2e440eb7db9911b65ee048@o4510205924999168.ingest.de.sentry.io/4511061622325328',
    sendDefaultPii: true,
});

export default Sentry;
