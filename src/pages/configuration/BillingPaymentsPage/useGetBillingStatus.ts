import { ApolloError, ApolloQueryResult, DocumentNode, gql, NetworkStatus, useQuery } from '@apollo/client';

function useGetBillingStatus(): [
  QueryType['billing'] | null,
  boolean,
  ApolloError | undefined,
  () => Promise<ApolloQueryResult<QueryType>>
] {
  const res = useQuery<QueryType>(queryString(), {
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });
  const loading = res.loading || res.networkStatus === NetworkStatus.refetch;

  if (res.data?.billing) {
    return [res.data.billing, loading, res.error, () => res.refetch()];
  }

  return [null, loading, undefined, () => res.refetch()];
}

interface QueryType {
  billing: {
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    subscription_last_payment?: string;
    subscription_active: boolean;
  };
}

function queryString(): DocumentNode {
  return gql`
    query billingStatus {
      billing {
        stripe_customer_id
        stripe_subscription_id
        subscription_last_payment
        subscription_active
      }
    }
  `;
}

export { useGetBillingStatus };
