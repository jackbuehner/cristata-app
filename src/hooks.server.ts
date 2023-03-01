import { VITE_BUILD_START_DATE_TIME, VITE_SENTRY_DSN } from '$env/static/public';
import { getUserForSentry } from '$utils/getUserForSentry';
import * as SentryNode from '@sentry/node';
import '@sentry/tracing';
import type { HandleClientError } from '@sveltejs/kit';

SentryNode.init({
  dsn: VITE_SENTRY_DSN,
  integrations: [new SentryNode.Integrations.Http()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

SentryNode.setTag('svelteKit', 'server');

export const handleError = (({ error, event }) => {
  SentryNode.setUser(getUserForSentry());

  const transaction = SentryNode.captureException(error, {
    contexts: { sveltekit: { ...event }, build: { Timestamp: VITE_BUILD_START_DATE_TIME } },
  });

  SentryNode.setUser(null);

  return {
    message: 'Something went wrong on the Cristata server.',
    transaction,
  };
}) satisfies HandleClientError;
