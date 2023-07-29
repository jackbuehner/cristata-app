import { Tokens, type TokensQuery, type TokensQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load = (async ({ params }) => {
  const tokens = queryWithStore<TokensQuery, TokensQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: Tokens,
    clearStoreBeforeFetch: true,
    waitForQuery: true,
    persistCache: 1000,
  });

  return {
    tokens,
  };
}) satisfies LayoutLoad;
