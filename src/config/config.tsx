import * as fluentIcons from '@fluentui/react-icons';
import { client } from '../graphql/client';
import { gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { Paged } from '../interfaces/cristata/paged';
import { paged } from '../graphql/paged';
import { ImageSearch24Regular, News24Regular, PersonBoard24Regular } from '@fluentui/react-icons';
import { isObject } from '../utils/isObject';
import { AuthUserState } from '../redux/slices/authUserSlice';

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

interface Inavigation {
  [key: string]: INavGroup[];
}

interface INavGroup {
  label: string;
  items: INavItem[];
}

interface INavItem {
  label: string;
  icon: keyof typeof fluentIcons;
  to: string;
  isHidden?: boolean | { notInTeam: string | string[] };
}

interface MainNavItem {
  label: string;
  icon: keyof typeof fluentIcons;
  to: string | { first: keyof Inavigation };
  isHidden?: boolean | { notInTeam: string | string[] };
  subNav?: 'forceCollapseForRoute' | 'hideMobile';
}

interface ReturnedMainNavItem extends MainNavItem {
  icon: keyof typeof fluentIcons;
  to: string;
}

function getNavigationConfig(key: 'main', user: AuthUserState): ReturnedMainNavItem[];
function getNavigationConfig(key: keyof Inavigation, user: AuthUserState): INavGroup[];
function getNavigationConfig(
  key: keyof Inavigation | 'main',
  user: AuthUserState
): INavGroup[] | ReturnedMainNavItem[] {
  const navigation: { main: MainNavItem[]; sub: Inavigation } = {
    main: [
      { label: 'Home', icon: 'Home32Regular', to: '/', subNav: 'forceCollapseForRoute' },
      { label: 'CMS', icon: 'ContentView32Regular', to: { first: 'cms' } },
      { label: 'Teams', icon: 'PeopleTeam28Regular', to: '/teams', subNav: 'hideMobile' },
      { label: 'Profiles', icon: 'Person32Regular', to: '/profile' },
      {
        label: 'API',
        icon: 'Play24Regular',
        to: '/playground',
        isHidden: { notInTeam: '000000000000000000000001' },
        subNav: 'hideMobile',
      },
      {
        label: 'Analytics',
        icon: 'DataUsage24Regular',
        to: '/embed/fathom',
        isHidden: { notInTeam: '000000000000000000000001' },
        subNav: 'forceCollapseForRoute',
      },
    ],
    sub: {
      cms: [
        {
          label: `Articles`,
          items: [
            {
              label: `In-progress articles`,
              icon: 'DocumentPageBottomRight24Regular',
              to: `/cms/collection/articles/in-progress`,
            },
            { label: `All articles`, icon: 'DocumentOnePage24Regular', to: `/cms/collection/articles/all` },
            {
              label: `News articles (in-progress)`,
              icon: 'News24Regular',
              to: `/cms/collection/articles/in-progress?categories=%5B"news"%5D`,
            },
            {
              label: `Opinions (in-progress)`,
              icon: 'Chat24Regular',
              to: `/cms/collection/articles/in-progress?categories=%5B"opinion"%5D`,
            },
            {
              label: `Sports articles (in-progress)`,
              icon: 'Sport24Regular',
              to: `/cms/collection/articles/in-progress?categories=%5B"sports"%5D`,
            },
            {
              label: `Diversity matters articles (in-progress)`,
              icon: 'Star24Regular',
              to: `/cms/collection/articles/in-progress?categories=%5B"diversity"%5D`,
            },
            {
              label: `Arts articles (in-progress)`,
              icon: 'PaintBrush24Regular',
              to: `/cms/collection/articles/in-progress?categories=%5B"arts"%5D`,
            },
            {
              label: `Campus & culture articles (in-progress)`,
              icon: 'Balloon16Regular',
              to: `/cms/collection/articles/in-progress?categories=%5B"campus-culture"%5D`,
            },
          ],
        },
        {
          label: `Photos`,
          items: [
            {
              label: `Unfulfilled photo requests`,
              icon: 'ImageSearch24Regular',
              to: `/cms/collection/photo-requests/unfulfilled`,
            },
            {
              label: `All photo requests`,
              icon: 'ImageSearch24Regular',
              to: `/cms/collection/photo-requests/all`,
            },
            {
              label: `Photo library`,
              icon: 'Image24Regular',
              to: `/cms/photos/library`,
            },
          ],
        },
        {
          label: `Satire`,
          items: [
            {
              label: `In-progress satire`,
              icon: 'DocumentPageBottomRight24Regular',
              to: `/cms/collection/satire/in-progress`,
            },
            {
              label: `All satire`,
              icon: 'Cookies24Regular',
              to: `/cms/collection/satire/all`,
            },
          ],
        },
        {
          label: `The Royal Flush`,
          items: [
            {
              label: `(T)Issues`,
              icon: 'Document24Regular',
              to: `/cms/collection/flush`,
              isHidden: { notInTeam: ['000000000000000000000001', '000000000000000000000009'] },
            },
          ],
        },
        {
          label: `Short URLs`,
          items: [
            {
              label: `flusher.page`,
              icon: 'BookGlobe24Regular',
              to: `/cms/collection/shorturl`,
              isHidden: { notInTeam: ['000000000000000000000001', '000000000000000000000008'] },
            },
          ],
        },
        {
          label: `Configuration`,
          items: [
            {
              label: `Featured articles`,
              icon: 'StarEmphasis24Regular',
              to: `/cms/item/featured-settings/6101da4a5386ae9ea3147f17`,
              isHidden: { notInTeam: '000000000000000000000001' },
            },
            {
              label: `Social media articles (LIFT)`,
              icon: 'LinkSquare24Regular',
              to: `/cms/item/social-articles/615ff1210e3e31a22a3c5746`,
              isHidden: { notInTeam: ['000000000000000000000001', '000000000000000000000007'] },
            },
          ],
        },
      ],
    },
  };

  // filter out hidden group items
  const filterHidden = (groups: INavGroup[] | undefined): INavGroup[] => {
    if (!groups) return [];
    return groups
      .map((group) => {
        // store the group items that are not hidden
        const enabledGroupItems = group.items.filter((item) => {
          if (isObject(item.isHidden)) {
            if (typeof item.isHidden.notInTeam === 'string') {
              return user.teams.includes(item.isHidden.notInTeam);
            }
            return item.isHidden.notInTeam.some((team) => user.teams.includes(team));
          }
          return item.isHidden !== true;
        });

        // if there are no visible items, do not show the group
        if (enabledGroupItems.length === 0) return null;

        // otherwise, return the group
        return { ...group, items: enabledGroupItems };
      })
      .filter((group): group is INavGroup => !!group);
  };

  // if the key is main, return the items for the main navigation
  if (key === 'main') {
    return navigation.main
      .filter((item): item is Omit<MainNavItem, 'isHidden'> & Pick<ReturnedMainNavItem, 'isHidden'> => {
        if (isObject(item.isHidden)) {
          if (typeof item.isHidden.notInTeam === 'string') {
            return user.teams.includes(item.isHidden.notInTeam);
          }
          return item.isHidden.notInTeam.some((team) => user.teams.includes(team));
        }
        return item.isHidden !== true;
      })
      .map((item): ReturnedMainNavItem => {
        if (isObject(item.to)) {
          return { ...item, to: filterHidden(navigation.sub[item.to.first])[0]?.items?.[0]?.to || '/' };
        }
        return { ...item, to: item.to };
      });
  }

  // return the filtered navigation group
  return filterHidden(navigation.sub[key]);
}

export { collections } from './collections';
export { home, getNavigationConfig };
export type { tiptapOptions } from './collections';
