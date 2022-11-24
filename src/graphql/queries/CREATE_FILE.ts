import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Creates a file document.
 *
 * @returns document _id
 */
const CREATE_FILE = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        name: 'String!',
        file_type: 'String!',
        size_bytes: 'Int!',
        location: 'String!',
      },
      fileCreate: {
        __args: {
          name: new VariableType('name'),
          file_type: new VariableType('file_type'),
          size_bytes: new VariableType('size_bytes'),
          location: new VariableType('location'),
        },
        _id: true,
      },
    },
  })
);

type CREATE_FILE__TYPE =
  | {
      fileCreate: CREATE_FILE__DOC_TYPE;
    }
  | undefined;

type CREATE_FILE__DOC_TYPE = {
  _id: string;
};

export { CREATE_FILE };
export type { CREATE_FILE__TYPE, CREATE_FILE__DOC_TYPE };
