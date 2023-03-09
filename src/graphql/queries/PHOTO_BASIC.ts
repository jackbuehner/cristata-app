import { parse } from 'graphql';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Gets some basic data about a photo by _id.
 */
const PHOTO_BASIC = parse(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        _id: 'ObjectID!',
      },
      photo: {
        __args: {
          _id: new VariableType('_id'),
        },
        _id: true,
        name: true,
        photo_url: true,
        tags: true,
        people: {
          photo_created_by: true,
        },
      },
    },
  })
);

type PHOTO_BASIC__TYPE =
  | {
      photo: PHOTO_BASIC__DOC_TYPE;
    }
  | undefined;

type PHOTO_BASIC__DOC_TYPE = {
  _id: string;
  name: string;
  photo_url: string;
  tags: string[];
  people: {
    photo_created_by?: string;
  };
};

export { PHOTO_BASIC };
export type { PHOTO_BASIC__DOC_TYPE, PHOTO_BASIC__TYPE };
