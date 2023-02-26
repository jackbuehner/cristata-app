import type { ApolloError, ApolloQueryResult } from '@apollo/client';
import { NetworkStatus, useQuery } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

function useGetCollections(): [
  QueryType['configuration']['collections'],
  boolean,
  ApolloError | undefined,
  () => Promise<ApolloQueryResult<QueryType>>
] {
  const res = useQuery<QueryType>(queryString(), {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const loading = res.loading || res.networkStatus === NetworkStatus.refetch;

  if (res.data?.configuration.collections) {
    return [res.data.configuration.collections, loading, res.error, () => res.refetch()];
  }

  return [[], false, undefined, () => res.refetch()];
}

interface QueryType {
  configuration: {
    collections?: Array<{
      name: string;
    }>;
  };
}

function queryString(): DocumentNode {
  return gql`
    query configurationNavigationCollection {
      configuration {
        collections {
          name
        }
      }
    }
  `;
}

export { useGetCollections };
