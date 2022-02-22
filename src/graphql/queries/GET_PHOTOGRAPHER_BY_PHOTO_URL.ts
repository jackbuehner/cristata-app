import { gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

const GET_PHOTOGRAPHER_BY_PHOTO_URL = (url: string) => {
  if (url === '' || !url) url = 'NO_PHOTO';

  return gql(
    jsonToGraphQLQuery({
      query: {
        photos: {
          __args: {
            limit: 1,
            filter: JSON.stringify({
              photo_url: url,
            }),
          },
          docs: {
            _id: true,
            people: {
              photo_created_by: true,
            },
          },
        },
      },
    })
  );
};

type GET_PHOTOGRAPHER_BY_PHOTO_URL__TYPE =
  | {
      photos: {
        docs: {
          _id: string;
          people?: {
            photo_created_by?: string;
          };
        }[];
      };
    }
  | undefined;

export { GET_PHOTOGRAPHER_BY_PHOTO_URL };
export type { GET_PHOTOGRAPHER_BY_PHOTO_URL__TYPE };
