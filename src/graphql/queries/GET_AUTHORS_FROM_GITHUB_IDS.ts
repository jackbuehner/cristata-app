import { gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

const GET_AUTHORS_FROM_GITHUB_IDS = (github_ids: number[]) =>
  gql(
    jsonToGraphQLQuery({
      query: {
        users: {
          __args: {
            limit: 1,
            filter: JSON.stringify({
              github_id: {
                $in: github_ids,
              },
            }),
          },
          docs: {
            _id: true,
            name: true,
            photo: true,
            slug: true,
          },
        },
      },
    })
  );

type GET_AUTHORS_FROM_GITHUB_IDS__TYPE =
  | {
      users: {
        docs: {
          _id: string;
          name: string;
          slug: string;
          photo?: string;
        }[];
      };
    }
  | undefined;

export { GET_AUTHORS_FROM_GITHUB_IDS };
export type { GET_AUTHORS_FROM_GITHUB_IDS__TYPE };
