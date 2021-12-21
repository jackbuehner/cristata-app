import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Gets basic data about a user: name, _id, current_title, email, phone, and photo.
 */
const PROFILE_BASIC = gql(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        _id: 'ObjectID!',
      },
      profile: {
        __aliasFor: 'user',
        __args: {
          _id: new VariableType('_id'),
        },
        _id: true,
        name: true,
        phone: true,
        email: true,
        current_title: true,
        photo: true,
      },
    },
  })
);

type PROFILE_BASIC__TYPE =
  | {
      profile: PROFILE_BASIC__DOC_TYPE;
    }
  | undefined;

type PROFILE_BASIC__DOC_TYPE = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  current_title?: string;
  photo?: string;
};

export { PROFILE_BASIC };
export type { PROFILE_BASIC__TYPE, PROFILE_BASIC__DOC_TYPE };
