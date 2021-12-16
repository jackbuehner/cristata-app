import { ApolloClient, InMemoryCache } from '@apollo/client';
import { merge } from 'merge-anything';
import { collections } from '../config';
import { Paged } from '../interfaces/cristata/paged';
import { ClientConsumer } from './ClientConsumer';

const collectionPluralNames = [
  ...new Set(
    Object.entries(collections).map(([key, value]) => {
      return value!.query.name.plural;
    })
  ),
];

const collectionQueryTypePolicies = collectionPluralNames.map((query) => {
  return {
    [query]: {
      // Don't cache separate results based on
      // any of this field's arguments.
      keyArgs: ['sort', 'filter'],
      // Concatenate the incoming list items with
      // the existing list items.
      merge(existing = { docs: [] }, incoming: Paged<unknown>) {
        // NOTE: this merge expects incoming data be sequentially after existing data
        return {
          ...incoming,
          docs: [...existing.docs, ...incoming.docs],
        };
      },
    },
  };
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: merge({}, ...collectionQueryTypePolicies),
    },
  },
});

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/v3`,
  //uri: `https://api.thepaladin.dev.cristata.app/v3`,
  cache,
  credentials: 'include',
});

type mongoFilterType = { [key: string]: string | boolean | number | string[] | number[] | mongoFilterType };
type mongoSortType = { [key: string]: -1 | 1 };

export type { mongoFilterType, mongoSortType };
export { client, ClientConsumer };
