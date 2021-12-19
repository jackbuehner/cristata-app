import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Creates a photo document.
 *
 * @returns profile _id
 */
const CREATE_PHOTO = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        name: 'String!',
      },
      photoCreate: {
        __args: {
          name: new VariableType('name'),
        },
        _id: true,
      },
    },
  })
);

type CREATE_PHOTO__TYPE =
  | {
      photoCreate: CREATE_PHOTO__DOC_TYPE;
    }
  | undefined;

type CREATE_PHOTO__DOC_TYPE = {
  _id: string;
};

export { CREATE_PHOTO };
export type { CREATE_PHOTO__TYPE, CREATE_PHOTO__DOC_TYPE };
