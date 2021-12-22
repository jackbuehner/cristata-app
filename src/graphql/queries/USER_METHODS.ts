import { gql } from '@apollo/client';

/**
 * Gets whether a user exists by username
 */
const USER_METHODS = gql`
  query ($username: String!) {
    userMethods(username: $username)
  }
`;

type USER_METHODS__TYPE =
  | {
      userMethods: string[];
    }
  | undefined;

export { USER_METHODS };
export type { USER_METHODS__TYPE };
