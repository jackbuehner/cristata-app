import { parse } from 'graphql';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Deletes a team document.
 *
 * __THIS CANNOT BE UNDONE__
 *
 * @returns team _id
 */
const DELETE_TEAM = parse(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        _id: 'ObjectID!',
      },
      teamDelete: {
        __args: {
          _id: new VariableType('_id'),
        },
      },
    },
  })
);

type DELETE_TEAM__TYPE =
  | {
      teamDelete: void;
    }
  | undefined;

export { DELETE_TEAM };
export type { DELETE_TEAM__TYPE };
