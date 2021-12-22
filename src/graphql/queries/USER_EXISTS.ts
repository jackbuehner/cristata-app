import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Gets whether a user exists by username
 */
const USER_EXISTS = gql`
  query ($username: String!) {
    userExists(username: $username)
  }
`;

type USER_EXISTS__TYPE =
  | {
      userExists: boolean;
    }
  | undefined;

export { USER_EXISTS };
export type { USER_EXISTS__TYPE };
