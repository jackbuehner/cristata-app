import { parse } from 'graphql';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

const STAGE_COUNTS = parse(
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
