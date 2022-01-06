import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { Paged } from '../../interfaces/cristata/paged';
import { paged } from '../paged';

/**
 * Get history for cms collections.
 */
const HISTORY = gql(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        limit: 'Int! = 10',
        page: 'Int = 1',
        collections: '[String]',
        exclude: '[String]',
      },
      collectionActivity: {
        __args: {
          limit: new VariableType('limit'),
          page: new VariableType('page'),
          collections: new VariableType('collections'),
          exclude: new VariableType('exclude'),
        },
        ...paged({
          _id: true,
          name: true,
          in: true,
          user: {
            _id: true,
            name: true,
            photo: true,
          },
          action: true,
          at: true,
        }),
      },
    },
  })
);

type HISTORY__TYPE =
  | {
      collectionActivity: Paged<HISTORY__DOC_TYPE>;
    }
  | undefined;

type HISTORY__DOC_TYPE = {
  _id: string;
  name: string;
  in: string;
  user: {
    _id: string;
    name: string;
    photo?: string;
  };
  action: string;
  at: string; // ISO date
};

export { HISTORY };
export type { HISTORY__TYPE, HISTORY__DOC_TYPE };
