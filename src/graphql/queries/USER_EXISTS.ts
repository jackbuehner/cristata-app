import { gql } from 'graphql-tag';

/**
 * Gets whether a user exists by username
 */
const USER_EXISTS = gql`
  query ($username: String!) {
    userExists(username: $username) {
      exists
      doc {
        name
        email
      }
    }
  }
`;

type USER_EXISTS__TYPE =
  | {
      userExists: {
        exists: boolean;
        doc?: {
          name: string;
          email: string;
          slug: string;
        };
      };
    }
  | undefined;

export { USER_EXISTS };
export type { USER_EXISTS__TYPE };
