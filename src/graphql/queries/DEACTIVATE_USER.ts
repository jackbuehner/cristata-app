import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Deactivates a user
 *
 * @returns profile _id
 */
const DEACTIVATE_USER = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        _id: 'ObjectID!',
        deactivate: 'Boolean',
      },
      userDeactivate: {
        __args: {
          _id: new VariableType('_id'),
          deactivate: new VariableType('deactivate'),
        },
        _id: true,
        retired: true,
      },
    },
  })
);

type DEACTIVATE_USER__TYPE =
  | {
      userDeactivate: DEACTIVATE_USER__DOC_TYPE;
    }
  | undefined;

type DEACTIVATE_USER__DOC_TYPE = {
  _id: string;
  retired?: boolean;
};

export { DEACTIVATE_USER };
export type { DEACTIVATE_USER__TYPE, DEACTIVATE_USER__DOC_TYPE };
