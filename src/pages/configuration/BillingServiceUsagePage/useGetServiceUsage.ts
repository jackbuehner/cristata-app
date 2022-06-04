import { ApolloError, ApolloQueryResult, DocumentNode, gql, NetworkStatus, useQuery } from '@apollo/client';

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
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });
  const loading = res.loading || res.networkStatus === NetworkStatus.refetch;

  if (res.data?.billing.usage.api) {
    return [res.data.billing, loading, res.error, () => res.refetch()];
  }

  return [null, false, undefined, () => res.refetch()];
}

interface QueryType {
  billing: {
    usage: {
      api?: {
        billable: number;
        total: number;
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
          api(month: ${month}, year: ${year}) {
            billable
            total
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
