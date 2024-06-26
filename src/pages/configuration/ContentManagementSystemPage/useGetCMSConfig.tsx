import type { ApolloError, ApolloQueryResult } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

import * as apolloRaw from '@apollo/client';
const { NetworkStatus, useQuery } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

function useGetCMSConfig(): [
  QueryType['configuration'] | null,
  boolean,
  ApolloError | undefined,
  () => Promise<ApolloQueryResult<QueryType>>
] {
  const res = useQuery<QueryType>(queryString(), {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const loading = res.loading || res.networkStatus === NetworkStatus.refetch;

  if (res.data?.configuration) {
    return [res.data.configuration, loading, res.error, () => res.refetch()];
  }

  return [null, loading, undefined, () => res.refetch()];
}

interface QueryType {
  configuration: {
    navigation: {
      sub: Array<{
        /**
         * uuid
         */
        id: string;
        label: string;
        items: Array<{
          /**
           * uuid
           */
          id: string;
          icon: string;
          label: string;
          to: string;
          hiddenFilter?: { notInTeam?: string[] };
        }>;
      }>;
    };
  };
}

function queryString(): DocumentNode {
  return gql`
    query securityTokensAndSecrets {
      configuration {
        navigation {
          sub(key: "cms") {
            id: uuid
            label
            items {
              id: uuid
              icon
              label
              to
              hiddenFilter {
                notInTeam
              }
            }
          }
        }
      }
    }
  `;
}

export { useGetCMSConfig };
