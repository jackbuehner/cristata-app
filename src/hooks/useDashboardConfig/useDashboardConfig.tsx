/* eslint-disable no-useless-escape */
import { ApolloError, ApolloQueryResult, gql, useQuery } from '@apollo/client';
import { FluentIconNames } from '../../components/FluentIcon';

/**
 * Gets the config for the home dashboard.
 *
 * @returns [config, error, refetch()]
 */
function useDashboardConfig(
  key: 'collectionRows'
): [Home['collectionRows'] | undefined, ApolloError | undefined, () => Promise<ApolloQueryResult<QueryType>>] {
  const res = useQuery<QueryType>(QUERY, { fetchPolicy: 'cache-and-network' });

  return [res.data?.dashboardConfig.dashboard.collectionRows, res.error, res.refetch];
}

interface QueryType {
  dashboardConfig: {
    dashboard: {
      collectionRows: Home['collectionRows'];
    };
  };
}

const QUERY = gql`
  query dashboardConfig {
    dashboardConfig: configuration {
      dashboard {
        collectionRows {
          arrPath
          header {
            icon
            label
          }
          query
          to {
            idPrefix
            idSuffix
          }
          dataKeys {
            _id
            description
            lastModifiedAt
            lastModifiedBy
            name
            photo
          }
        }
      }
    }
  }
`;

interface Home {
  collectionRows: Array<{
    /**
     * Information for the header row for the collection row.
     * Contains things like the label and the icon.
     */
    header: {
      /**
       * The label of this collection row. It does not need to be the same
       * as the collection name.
       */
      label: string;
      /**
       * The icon to appear in front of the label. Any icon from
       * `@fluentui/react-icons` is valid.
       */
      icon: FluentIconNames;
    };
    /**
     * The parts of the the location to navigate upon clicking an item in the
     * row. The location is a string concatenation of `idPrefix + _id + idSuffix`,
     * where `_id` is the unique identifier of the item that is clicked.
     */
    to: {
      /**
       * Prepend the `_id` with this string.
       *
       * For example: `'/cms/item/articles/'`
       */
      idPrefix: string;
      /**
       * Append the `_id` with this string.
       *
       * For example: `'?fs=force&comments=1'`
       */
      idSuffix: string;
    };
    /**
     * A valid GraphQL query string to retrieve the needed data.
     *
     * Be sure to use a named query so the query does not disturb
     * existing caches for the collections in the CMS table view.
     */
    query: string;
    /**
     * The path to the array containing the documents.
     */
    arrPath: string;
    /**
     * The keys corresponding to the data displayed in the collection row.
     */
    dataKeys: {
      /**
       * The identifier for the document.
       * This is usually a field with an ObjectId.
       */
      _id: string;
      /**
       * The name or title of the document.
       */
      name: string;
      /**
       * Description or other caption to appear under the document name.
       */
      description?: string;
      /**
       * Photo associated with the document.
       */
      photo?: string;
      /**
       * Name of the person who last modified the document.
       */
      lastModifiedBy: string;
      /**
       * Last modified at.
       */
      lastModifiedAt: string;
    };
  }>;
}

export type { Home };
export { useDashboardConfig };
