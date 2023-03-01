import { VITE_BUILD_START_DATE_TIME, VITE_SENTRY_DSN } from '$env/static/public';
import { getUserForSentry } from '$utils/getUserForSentry';
import * as SentrySvelte from '@sentry/svelte';
import { BrowserTracing } from '@sentry/tracing';
import type { HandleClientError } from '@sveltejs/kit';

SentrySvelte.init({
  dsn: VITE_SENTRY_DSN,
  integrations: [new BrowserTracing(), new SentrySvelte.Replay()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
});

SentrySvelte.setTag('svelteKit', 'browser');

export const handleError = (({ error, event }) => {
  SentrySvelte.setUser(getUserForSentry());

  const transaction = SentrySvelte.captureException(error, {
    contexts: { sveltekit: { ...event }, build: { Timestamp: VITE_BUILD_START_DATE_TIME } },
  });

  SentrySvelte.setUser(null);

  return {
    message: 'Something went wrong when loading Cristata in your browser.',
    transaction,
  };
}) satisfies HandleClientError;
