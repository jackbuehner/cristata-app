import type { ApolloError, ApolloQueryResult, DocumentNode, WatchQueryFetchPolicy } from '@apollo/client';
import { gql } from 'graphql-tag';
import type { FluentIconNames } from '../../components/FluentIcon';

import * as apolloRaw from '@apollo/client';
const { useQuery } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

/**
 * Gets the navigation config for the specified navigation.
 *
 * Specify 'main' to get the main navigation.
 *
 * @returns [nav, error, refetch()]
 */
function useNavigationConfig(
  key: 'main',
  fetchPolicy?: WatchQueryFetchPolicy
): [MainNavItem[] | undefined, ApolloError | undefined, () => Promise<ApolloQueryResult<QueryType>>];
function useNavigationConfig(
  key: string
): [SubNavGroup[] | undefined, ApolloError | undefined, () => Promise<ApolloQueryResult<QueryType>>];
function useNavigationConfig(
  key: string
): [
  SubNavGroup[] | MainNavItem[] | undefined,
  ApolloError | undefined,
  () => Promise<ApolloQueryResult<QueryType>>
] {
  const res = useQuery<QueryType>(queryString(key), { fetchPolicy: 'cache-and-network' });

  if (key === 'main') {
    return [res.data?.configuration.navigation.main, res.error, res.refetch];
  }

  return [res.data?.configuration.navigation.sub, res.error, res.refetch];
}

interface QueryType {
  configuration: {
    navigation: {
      main?: MainNavItem[];
      sub?: SubNavGroup[];
    };
  };
}

interface MainNavItem {
  label: string;
  icon: FluentIconNames;
  to: string;
  subNav?: 'forceCollapseForRoute' | 'hideMobile';
}

interface SubNavGroup {
  label: string;
  items: Array<{
    label: string;
    icon: FluentIconNames;
    to: string;
  }>;
}

function queryString(key: string): DocumentNode {
  if (key === 'main') {
    return gql`
      query navigationConfiguration_${key} {
        configuration {
          navigation {
            main {
              label
              icon
              to
              subNav
            }
          }
        }
      }
    `;
  }
  return gql`
    query navigationConfiguration_${key} {
      configuration {
        navigation {
          sub(key: "${key}") {
            label
            items {
              label
              icon
              to
            }
          }
        }
      }
    }
  `;
}

export { useNavigationConfig };
