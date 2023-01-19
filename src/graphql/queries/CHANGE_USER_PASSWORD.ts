import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Changes a user's password.
 *
 * @returns profile _id
 */
const CHANGE_USER_PASSWORD = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        oldPassword: 'String!',
        newPassword: 'String!',
      },
      userPasswordChange: {
        __args: {
          oldPassword: new VariableType('oldPassword'),
          newPassword: new VariableType('newPassword'),
        },
        _id: true,
      },
    },
  })
);

type CHANGE_USER_PASSWORD__TYPE =
  | {
      userPasswordChange: CHANGE_USER_PASSWORD__DOC_TYPE;
    }
  | undefined;

type CHANGE_USER_PASSWORD__DOC_TYPE = {
  _id: string;
};

export { CHANGE_USER_PASSWORD };
export type { CHANGE_USER_PASSWORD__DOC_TYPE, CHANGE_USER_PASSWORD__TYPE };
