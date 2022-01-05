import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { Paged } from '../../interfaces/cristata/paged';
import { paged } from '../paged';

/**
 * Gets basic data about a set of users: name, _id, current_title, email, phone, and photo.
 */
const PROFILES_BASIC = gql(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        limit: 'Int = 10',
        page: 'Int = 1',
        _ids: '[ObjectID]',
      },
      profiles: {
        __aliasFor: 'users',
        __args: {
          limit: new VariableType('limit'),
          page: new VariableType('page'),
          _ids: new VariableType('_ids'),
          filter: JSON.stringify({ hidden: { $ne: true } }), // don't get hidden users
          sort: JSON.stringify({ group: 1, name: 1 }), // sort descending by group, then by name
        },
        ...paged({
          _id: true,
          name: true,
          phone: true,
          email: true,
          current_title: true,
          photo: true,
          retired: true,
          flags: true,
        }),
      },
    },
  })
);

type PROFILES_BASIC__TYPE =
  | {
      profiles: Paged<PROFILES_BASIC__DOC_TYPE>;
    }
  | undefined;

type PROFILES_BASIC__DOC_TYPE = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  current_title?: string;
  photo?: string;
  retired?: string;
  flags: string[];
};

export { PROFILES_BASIC };
export type { PROFILES_BASIC__TYPE, PROFILES_BASIC__DOC_TYPE };
