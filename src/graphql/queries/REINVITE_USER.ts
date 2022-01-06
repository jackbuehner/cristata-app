import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Reinvites a user.
 * Only works for users with already existing temporary passwords.
 *
 * @returns profile _id
 */
const REINVITE_USER = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        _id: 'ObjectID!',
      },
      userResendInvite: {
        __args: {
          _id: new VariableType('_id'),
        },
        _id: true,
      },
    },
  })
);

type REINVITE_USER__TYPE =
  | {
      userResendInvite: REINVITE_USER__DOC_TYPE;
    }
  | undefined;

type REINVITE_USER__DOC_TYPE = {
  _id: string;
  retired?: boolean;
};

export { REINVITE_USER };
export type { REINVITE_USER__TYPE, REINVITE_USER__DOC_TYPE };
