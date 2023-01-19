import type { ApolloError, ApolloQueryResult, DocumentNode } from '@apollo/client';
import { gql, NetworkStatus, useQuery } from '@apollo/client';

function useGetServiceUsage(
  month: number,
  year: number
): [
  QueryType['billing'] | null,
  boolean,
  ApolloError | undefined,
  () => Promise<ApolloQueryResult<QueryType>>
] {
  const res = useQuery<QueryType>(queryString(month, year), {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const loading = res.loading || res.networkStatus === NetworkStatus.refetch;

  if (res.data?.billing?.usage?.api) {
    return [res.data.billing, loading, res.error, () => res.refetch()];
  }

  return [null, loading, undefined, () => res.refetch()];
}

interface QueryType {
  billing: {
    usage: {
      api?: {
        billable: number;
        total: number;
        since: string; // ISO date
      };
      storage: {
        database: number;
        files: number;
      };
    };
  };
}

function queryString(month: number, year: number): DocumentNode {
  return gql`
    query serviceUsage {
      billing {
        usage {
          api {
            billable
            total
            since
          }
          storage {
            database
            files
          }
        }
      }
    }
  `;
}

export { useGetServiceUsage };
