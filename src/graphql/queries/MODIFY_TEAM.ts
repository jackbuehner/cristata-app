import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Modifies a team document.
 *
 * @returns team _id
 */
const MODIFY_TEAM = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        _id: 'ObjectID!',
        input: 'TeamModifyInput!',
      },
      teamModify: {
        __args: {
          _id: new VariableType('_id'),
          input: new VariableType('input'),
        },
        _id: true,
      },
    },
  })
);

type MODIFY_TEAM__TYPE =
  | {
      teamModify: MODIFY_TEAM__DOC_TYPE;
    }
  | undefined;

type MODIFY_TEAM__DOC_TYPE = {
  _id: string;
};

export { MODIFY_TEAM };
export type { MODIFY_TEAM__TYPE, MODIFY_TEAM__DOC_TYPE };
