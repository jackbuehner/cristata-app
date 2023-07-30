import { FathomSecrets, type FathomSecretsQuery, type FathomSecretsQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import { server } from '$utils/constants';
import type { DocumentNode } from 'graphql';
import { print } from 'graphql';
import { gql } from 'graphql-tag';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, params }) => {
  const fathomSecrets = queryWithStore<FathomSecretsQuery, FathomSecretsQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: FathomSecrets,
    clearStoreBeforeFetch: true,
  });

  const saveSecrets = async (
    variables: { key: 'fathom.siteId' | 'fathom.dashboardPassword'; value: string }[]
  ) => {
    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(saveSecretMutationString(variables)),
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then(({ data, errors }: { data: unknown; errors: any }) => {
        if (errors) throw Error(JSON.stringify(errors));
        return data;
      });
  };

  return { fathomSecrets, saveSecrets };
}) satisfies PageLoad;

function saveSecretMutationString(data: { key: string; value: string }[]): DocumentNode {
  return gql`
    mutation {
      ${data.map(({ key, value }, index) => {
        return `
          setSecret${key.split('.').slice(-1)}: setSecret(key: "${key}", value: "${value}")
        `;
      })}
    }
  `;
}
