import { gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

const STAGE_COUNTS = gql(
  jsonToGraphQLQuery({
    query: {
      workflow: {
        _id: true,
        count: true,
      },
    },
  })
);

type STAGE_COUNTS__TYPE =
  | {
      workflow: {
        _id: number;
        count: number;
      }[];
    }
  | undefined;

export { STAGE_COUNTS };
export type { STAGE_COUNTS__TYPE };
