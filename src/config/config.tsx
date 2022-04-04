import { client } from '../graphql/client';
import { gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { Paged } from '../interfaces/cristata/paged';
import { paged } from '../graphql/paged';
import { ImageSearch24Regular, News24Regular, PersonBoard24Regular } from '@fluentui/react-icons';

interface Ihome {
  recentItems: Array<{
    label: string;
    icon: React.ReactElement;
    data: () => Promise<Record<string, unknown>[] | undefined>;
    toPrefix: string;
    isProfile?: boolean;
    keys:
      | {
          name: string;
          lastModified: string;
          photo?: string;
          description?: string;
          toSuffix: string;
          history: string;
        }
      | {
          name: string;
          lastModified: string;
          photo?: string;
          description?: string;
          toSuffix: string;
          lastModifiedBy: string;
        };
  }>;
}

const home: Ihome = {
  recentItems: [
    {
      label: 'Articles',
      icon: <News24Regular />,
      data: async () => {
        const res = await client.query<{ articles?: Paged<Record<string, unknown>> }>({
          query: gql(
            jsonToGraphQLQuery({
              query: {
                articles: {
                  __args: {
                    limit: 20,
                    page: 1,
                    sort: JSON.stringify({ 'timestamps.modified_at': -1 }),
                  },
                  ...paged({
                    _id: true,
                    name: true,
                    description: true,
                    photo_path: true,
                    history: {
                      user: {
                        name: true,
                      },
                    },
                    timestamps: {
                      modified_at: true,
                    },
                  }),
                },
              },
            })
          ),
          fetchPolicy: 'no-cache',
        });
        return res.data.articles?.docs;
      },
      toPrefix: '/cms/item/articles/',
      keys: {
        photo: 'photo_path',
        name: 'name',
        history: 'history',
        lastModified: 'timestamps.modified_at',
        description: 'description',
        toSuffix: '_id',
      },
    },
    {
      label: 'Profiles',
      icon: <PersonBoard24Regular />,
      data: async () => {
        const res = await client.query<{ users?: Paged<Record<string, unknown>> }>({
          query: gql(
            jsonToGraphQLQuery({
              query: {
                users: {
                  __args: {
                    limit: 20,
                    page: 1,
                    sort: JSON.stringify({ 'timestamps.last_login_at': -1 }),
                  },
                  ...paged({
                    _id: true,
                    name: true,
                    timestamps: {
                      last_login_at: true,
                    },
                  }),
                },
              },
            })
          ),
          fetchPolicy: 'no-cache',
        });
        return res.data.users?.docs;
      },
      toPrefix: '/profile/',
      keys: {
        name: 'name',
        lastModified: 'timestamps.last_login_at',
        lastModifiedBy: '_id',
        toSuffix: '_id',
      },
      isProfile: true,
    },
    {
      label: 'Photo requests',
      icon: <ImageSearch24Regular />,
      data: async () => {
        const res = await client.query<{ photoRequests?: Paged<Record<string, unknown>> }>({
          query: gql(
            jsonToGraphQLQuery({
              query: {
                photoRequests: {
                  __args: {
                    limit: 20,
                    page: 1,
                    sort: JSON.stringify({ 'timestamps.modified_at': -1 }),
                  },
                  ...paged({
                    _id: true,
                    name: true,
                    history: {
                      user: {
                        name: true,
                      },
                    },
                    timestamps: {
                      modified_at: true,
                    },
                  }),
                },
              },
            })
          ),
          fetchPolicy: 'no-cache',
        });
        return res.data.photoRequests?.docs;
      },
      toPrefix: '/cms/item/photo-requests/',
      keys: {
        name: 'name',
        history: 'history',
        lastModified: 'timestamps.modified_at',
        toSuffix: '_id',
      },
    },
  ],
};

export { collections } from './collections';
export { home };
export type { tiptapOptions } from './collections';
