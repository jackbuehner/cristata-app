import { ApolloClient, InMemoryCache } from '@apollo/client';
import { merge } from 'merge-anything';
import { Paged } from '../interfaces/cristata/paged';
import { ClientConsumer } from './ClientConsumer';
import mongoose from 'mongoose';
import { server } from '../utils/constants';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';

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
      merge(existing: { docs: { _id: string }[] } = { docs: [] }, incoming: Paged<{ _id: string }>) {
        // NOTE: this merge expects incoming data be sequentially after existing data
        return {
          ...incoming,
          docs: [
            ...existing.docs,
            ...incoming.docs.filter(({ _id }) => {
              const idIsUnique = !existing.docs.map((doc) => doc._id).includes(_id);
              return idIsUnique;
            }),
          ],
        };
      },
    },
  };
});

const createCache = () => {
  // create the cache
  const cache = new InMemoryCache({
    addTypename: false,
    typePolicies: {
      Query: {
        fields: merge(
          {
            configuration: {
              merge: (existing: {}, incoming: {}) => {
                return merge(
                  JSON.parse(JSON.stringify(existing || {})),
                  JSON.parse(JSON.stringify(incoming || {}))
                );
              },
            },
          },
          ...collectionQueryTypePolicies
        ),
      },
    },
  });

  // persist the cache to localStorage
  persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  });

  // return the cache once the localstorage persistence
  // is set up
  return cache;
};

const createClient = (tenant?: string) =>
  new ApolloClient({
    uri: `${server.location}/v3/${tenant}`,
    //uri: `https://api.thepaladin.dev.cristata.app/v3`,
    cache: createCache(),
    credentials: 'include',
  });

type mongoFilterType = mongoose.FilterQuery<unknown>;
type mongoSortType = { [key: string]: -1 | 1 };

export type { mongoFilterType, mongoSortType };
export { createClient, ClientConsumer };
