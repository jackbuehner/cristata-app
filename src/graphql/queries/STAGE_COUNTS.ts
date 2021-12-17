import { gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

const STAGE_COUNTS = gql(
  jsonToGraphQLQuery({
    query: {
      articleStageCounts: {
        _id: true,
        count: true,
      },
      satireStageCounts: {
        _id: true,
        count: true,
      },
    },
  })
);

type STAGE_COUNTS__TYPE =
  | {
      articleStageCounts: {
        _id: number;
        count: number;
      }[];
      satireStageCounts: {
        _id: number;
        count: number;
      }[];
    }
  | undefined;

export { STAGE_COUNTS };
export type { STAGE_COUNTS__TYPE };
