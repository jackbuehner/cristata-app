import type { ApolloError, ApolloQueryResult, DocumentNode } from '@apollo/client';
import { gql, NetworkStatus, useQuery } from '@apollo/client';

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
      tokens: Array<{
        name: string;
        token: string;
        expires: string | 'never'; // ISO date OR 'never'
        scope: {
          admin: true;
        };
      }>;
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
          tokens {
            expires
            name
            scope {
              admin
            }
            token
          }
        }
      }
    }
  `;
}

export { useGetTokensAndSecrets };
