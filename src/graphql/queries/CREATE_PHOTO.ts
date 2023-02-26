import { parse } from 'graphql';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Creates a photo document.
 *
 * @returns profile _id
 */
const CREATE_PHOTO = parse(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        name: 'String!',
        file_type: 'String!',
        size_bytes: 'Int!',
        uuid: 'String!',
        width: 'Int!',
        height: 'Int!',
      },
      photoCreate: {
        __args: {
          name: new VariableType('name'),
          file_type: new VariableType('file_type'),
          size_bytes: new VariableType('size_bytes'),
          uuid: new VariableType('uuid'),
          width: new VariableType('width'),
          height: new VariableType('height'),
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

interface CREATE_PHOTO__VARIABLES {
  name: string;
  file_type: string;
  size_bytes: number;
  uuid: string;
  width: number;
  height: number;
}

type CREATE_PHOTO__DOC_TYPE = {
  _id: string;
};

export { CREATE_PHOTO };
export type { CREATE_PHOTO__DOC_TYPE, CREATE_PHOTO__TYPE, CREATE_PHOTO__VARIABLES };
