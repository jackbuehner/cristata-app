import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/v3`,
  //uri: `https://api.thepaladin.dev.cristata.app/v3`,
  cache: new InMemoryCache(),
  credentials: 'include',
});

export { client };
