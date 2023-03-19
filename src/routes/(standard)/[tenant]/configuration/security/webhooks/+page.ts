import { WebhooksList, type WebhooksListQuery, type WebhooksListQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params, url }) => {
  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '20';

  const webhooksList = queryWithStore<WebhooksListQuery, WebhooksListQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: WebhooksList,
    variables: {
      offset: parseInt(offset),
      limit: parseInt(limit),
      sort: JSON.stringify({ 'timestamps.created_at': -1 }),
    },
  });

  return {
    webhooksList,
  };
}) satisfies PageLoad;
