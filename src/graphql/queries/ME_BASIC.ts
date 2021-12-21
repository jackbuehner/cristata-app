import { gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

/**
 * Gets basic data about the current user: name, _id, current_title, email, and photo.
 */
const ME_BASIC = gql(
  jsonToGraphQLQuery({
    query: {
      me: {
        __aliasFor: 'user',
        _id: true,
        name: true,
        email: true,
        current_title: true,
        photo: true,
      },
    },
  })
);

type ME_BASIC__TYPE =
  | {
      me: {
        _id: string;
        name: string;
        email?: string;
        current_title?: string;
        photo?: string;
      };
    }
  | undefined;

export { ME_BASIC };
export type { ME_BASIC__TYPE };
