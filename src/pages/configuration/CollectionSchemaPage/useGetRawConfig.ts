import { ApolloError, ApolloQueryResult, DocumentNode, gql, NetworkStatus, useQuery } from '@apollo/client';
import { Collection } from '@jackbuehner/cristata-api/dist/types/config';

function useGetRawConfig(
  name: string
): [Collection | null, boolean, ApolloError | undefined, () => Promise<ApolloQueryResult<QueryType>>] {
  const res = useQuery<QueryType>(queryString(name), {
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });
  const loading = res.loading || res.networkStatus === NetworkStatus.refetch;

  if (res.data?.configuration.collection?.raw && name !== 'User' && name !== 'Team') {
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
