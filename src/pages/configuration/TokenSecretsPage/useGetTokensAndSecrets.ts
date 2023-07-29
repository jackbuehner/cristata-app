import type { ApolloError, ApolloQueryResult } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

import * as apolloRaw from '@apollo/client';
const { NetworkStatus, useQuery } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

function useGetTokensAndSecrets(): [
  QueryType['configuration']['security'] | null,
  boolean,
  ApolloError | undefined,
  () => Promise<ApolloQueryResult<QueryType>>
] {
  const res = useQuery<QueryType>(queryString(), {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const loading = res.loading || res.networkStatus === NetworkStatus.refetch;

  if (res.data?.configuration.security) {
    return [res.data.configuration.security, loading, res.error, () => res.refetch()];
  }

  return [null, loading, undefined, () => res.refetch()];
}

interface QueryType {
  configuration: {
    security: {
      secrets: {
        fathom?: {
          siteId: string;
          dashboardPassword: string;
        };
      };
    };
  };
}

function queryString(): DocumentNode {
  return gql`
    query securityTokensAndSecrets {
      configuration {
        security {
          introspection
          secrets {
            fathom {
              dashboardPassword
              siteId
            }
          }
        }
      }
    }
  `;
}

export { useGetTokensAndSecrets };
