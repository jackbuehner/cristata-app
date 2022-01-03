import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Creates a new user.
 *
 * @returns profile _id
 */
const CREATE_USER = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        name: 'String!',
        username: 'String!',
        slug: 'String!',
        email: 'String!',
        current_title: 'String!',
      },
      userCreate: {
        __args: {
          name: new VariableType('name'),
          username: new VariableType('username'),
          slug: new VariableType('slug'),
          email: new VariableType('email'),
          current_title: new VariableType('current_title'),
        },
        _id: true,
      },
    },
  })
);

type CREATE_USER__TYPE =
  | {
      userCreate: CREATE_USER__DOC_TYPE;
    }
  | undefined;

type CREATE_USER__DOC_TYPE = {
  _id: string;
};

export { CREATE_USER };
export type { CREATE_USER__TYPE, CREATE_USER__DOC_TYPE };
