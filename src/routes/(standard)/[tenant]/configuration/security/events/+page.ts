import { EventsList, type EventsListQuery, type EventsListQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params, url }) => {
  const offset = url.searchParams.get('offset') || '0';
  const limit = url.searchParams.get('limit') || '20';

  const eventsList = queryWithStore<EventsListQuery, EventsListQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: EventsList,
    variables: {
      offset: parseInt(offset),
      limit: parseInt(limit),
      // filter to only include documents since this date so that
      // loading new documents does not result in missed documents
      // if new documents were inserted between initial load and
      // when new docs are loaded to the UI
      filter: JSON.stringify({ at: { $lt: new Date() } }),
      sort: JSON.stringify({ at: -1 }),
    },
  });

  return {
    eventsList,
  };
}) satisfies PageLoad;
