import { parse } from 'graphql';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Modifies a photo document.
 *
 * @returns profile _id
 */
const MODIFY_PHOTO = parse(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        _id: 'ObjectID!',
        input: 'PhotoModifyInput!',
      },
      photoModify: {
        __args: {
          _id: new VariableType('_id'),
          input: new VariableType('input'),
        },
        _id: true,
      },
    },
  })
);

type MODIFY_PHOTO__TYPE =
  | {
      photoModify: MODIFY_PHOTO__DOC_TYPE;
    }
  | undefined;

type MODIFY_PHOTO__DOC_TYPE = {
  _id: string;
};

export { MODIFY_PHOTO };
export type { MODIFY_PHOTO__DOC_TYPE, MODIFY_PHOTO__TYPE };
