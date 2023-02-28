import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { ApolloConsumerProps } from '@apollo/client/react/context';
import type { ReactChild } from 'react';

import * as apolloRaw from '@apollo/client';
const { ApolloConsumer } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

interface ClientConsumerProps extends Omit<ApolloConsumerProps, 'children'> {
  children: (client: ApolloClient<NormalizedCacheObject>) => ReactChild | null;
}

function ClientConsumer(props: ClientConsumerProps) {
  return (
    <ApolloConsumer>{(client) => props.children(client as ApolloClient<NormalizedCacheObject>)}</ApolloConsumer>
  );
}

export { ClientConsumer };
