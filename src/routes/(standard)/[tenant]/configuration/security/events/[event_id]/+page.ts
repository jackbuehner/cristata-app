import { Event, type EventQuery, type EventQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params, url }) => {
  console.log(params.event_id);

  const event = queryWithStore<EventQuery, EventQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: Event,
    variables: {
      _id: params.event_id,
    },
  });

  return {
    event,
  };
}) satisfies PageLoad;
