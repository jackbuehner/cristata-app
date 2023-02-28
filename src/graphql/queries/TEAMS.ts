import { parse } from 'graphql';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import type { Paged } from '../../interfaces/cristata/paged';
import { paged } from '../paged';

/**
 * Gets all teams.
 */
const TEAMS = parse(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        limit: 'Int = 10',
        page: 'Int = 1',
        _ids: '[ObjectID]',
      },
      teams: {
        __args: {
          limit: new VariableType('limit'),
          page: new VariableType('page'),
          _ids: new VariableType('_ids'),
          filter: JSON.stringify({ hidden: { $ne: true } }), // exclude hidden teams
          sort: JSON.stringify({ name: 1 }), // sort alphabetical A-Z
        },
        ...paged({
          _id: true,
          name: true,
          slug: true,
          members: {
            _id: true,
            name: true,
          },
          organizers: {
            _id: true,
            name: true,
          },
        }),
      },
    },
  })
);

type TEAMS__TYPE =
  | {
      teams: Paged<TEAMS__DOC_TYPE>;
    }
  | undefined;

type TEAMS__DOC_TYPE = {
  _id: string;
  name: string;
  slug: string;
  members: { _id: string; name: string }[];
  organizers: { _id: string; name: string }[];
};

export { TEAMS };
export type { TEAMS__DOC_TYPE, TEAMS__TYPE };
