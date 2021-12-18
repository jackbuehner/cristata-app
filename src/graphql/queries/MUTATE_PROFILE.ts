import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Mutates a user profile.
 *
 * @returns profile _id
 */
const MUTATE_PROFILE = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        _id: 'ObjectID!',
        input: 'UserModifyInput!',
      },
      userModify: {
        __args: {
          _id: new VariableType('_id'),
          input: new VariableType('input'),
        },
        _id: true,
      },
    },
  })
);

type MUTATE_PROFILE__TYPE =
  | {
      userModify: MUTATE_PROFILE__DOC_TYPE;
    }
  | undefined;

type MUTATE_PROFILE__DOC_TYPE = {
  _id: string;
};

export { MUTATE_PROFILE };
export type { MUTATE_PROFILE__TYPE, MUTATE_PROFILE__DOC_TYPE };
