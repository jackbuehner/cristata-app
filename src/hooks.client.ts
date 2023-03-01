import { VITE_BUILD_START_DATE_TIME, VITE_SENTRY_DSN } from '$env/static/public';
import { BasicProfileMe, type BasicProfileMeQuery } from '$graphql/graphql';
import { getQueryStore } from '$graphql/query';
import { authCache } from '$stores/authCache';
import { getUserForSentry } from '$utils/getUserForSentry';
import type { User as SentryUser } from '@sentry/svelte';
import * as SentrySvelte from '@sentry/svelte';
import { BrowserTracing } from '@sentry/tracing';
import type { HandleClientError } from '@sveltejs/kit';
import { getOperationAST } from 'graphql';
import { get as getStoreValue } from 'svelte/store';

SentrySvelte.init({
  dsn: VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
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
