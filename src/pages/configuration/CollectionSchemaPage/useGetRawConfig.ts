import type { ApolloError, ApolloQueryResult } from '@apollo/client';
import type { GenCollectionInput } from '@jackbuehner/cristata-api/dist/graphql/helpers/generators/genCollection';
import type { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

import * as apolloRaw from '@apollo/client';
const { NetworkStatus, useQuery } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

function useGetRawConfig(
  name: string
): [GenCollectionInput | null, boolean, ApolloError | undefined, () => Promise<ApolloQueryResult<QueryType>>] {
  const res = useQuery<QueryType>(queryString(name), {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const loading = res.loading || res.networkStatus === NetworkStatus.refetch;

  if (res.data?.configuration.collection?.raw && name !== 'Team') {
    const parsed = JSON.parse(res.data.configuration.collection.raw);
    delete parsed.skipAdditionalParsing;
    return [parsed, loading, res.error, () => res.refetch()];
  }

  return [null, false, undefined, () => res.refetch()];
}

interface QueryType {
  configuration: {
    collection?: {
      raw: string; // JSON string
    };
  };
}

function queryString(name: string): DocumentNode {
  return gql`
    query collectionRaw${name} {
      configuration {
        collection(name: "${name}") {
          raw
        }
      }
    }
  `;
}

export { useGetRawConfig };
