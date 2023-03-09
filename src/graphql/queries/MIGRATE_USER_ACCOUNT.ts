import { parse } from 'graphql';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Migrates a user's account to a local account.
 *
 * @returns profile _id
 */
const MIGRATE_USER_ACCOUNT = parse(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        _id: 'ObjectID!',
      },
      userMigrateToPassword: {
        __args: {
          _id: new VariableType('_id'),
        },
        _id: true,
      },
    },
  })
);

type MIGRATE_USER_ACCOUNT__TYPE =
  | {
      userMigrateToPassword: MIGRATE_USER_ACCOUNT__DOC_TYPE;
    }
  | undefined;

type MIGRATE_USER_ACCOUNT__DOC_TYPE = {
  _id: string;
};

export { MIGRATE_USER_ACCOUNT };
export type { MIGRATE_USER_ACCOUNT__DOC_TYPE, MIGRATE_USER_ACCOUNT__TYPE };
