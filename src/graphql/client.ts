import { ApolloClient, InMemoryCache } from '@apollo/client';
import { merge } from 'merge-anything';
import { Paged } from '../interfaces/cristata/paged';
import { ClientConsumer } from './ClientConsumer';
import mongoose from 'mongoose';

const collectionPluralNames = [
  'articles',
  'settings',
  'flushes',
  'photoRequests',
  'photos',
  'satires',
  'shorturls',
];

const collectionQueryTypePolicies = [...collectionPluralNames, 'users', 'teams'].map((query) => {
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
  addTypename: false,
  typePolicies: {
    Query: {
      fields: merge({}, ...collectionQueryTypePolicies),
    },
  },
});

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/v3`,
  //uri: `https://api.thepaladin.dev.cristata.app/v3`,
  cache,
  credentials: 'include',
});

type mongoFilterType = mongoose.FilterQuery<unknown>;
type mongoSortType = { [key: string]: -1 | 1 };

export type { mongoFilterType, mongoSortType };
export { client, ClientConsumer };
