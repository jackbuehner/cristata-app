import { ApolloClient, NormalizedCacheObject, ApolloConsumer } from '@apollo/client';
import { ApolloConsumerProps } from '@apollo/client/react/context';
import { ReactChild } from 'react';

interface ClientConsumerProps extends Omit<ApolloConsumerProps, 'children'> {
  children: (client: ApolloClient<NormalizedCacheObject>) => ReactChild | null;
}

function ClientConsumer(props: ClientConsumerProps) {
  return (
    <ApolloConsumer>{(client) => props.children(client as ApolloClient<NormalizedCacheObject>)}</ApolloConsumer>
  );
}

export { ClientConsumer };
