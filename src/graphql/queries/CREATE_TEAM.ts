import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Creates a photo document.
 *
 * @returns profile _id
 */
const CREATE_TEAM = gql(
  jsonToGraphQLQuery({
    mutation: {
      __variables: {
        name: 'String!',
        slug: 'String!',
        members: '[ObjectID]!',
        organizers: '[ObjectID]!',
      },
      teamCreate: {
        __args: {
          name: new VariableType('name'),
          slug: new VariableType('slug'),
          members: new VariableType('members'),
          organizers: new VariableType('organizers'),
        },
        _id: true,
      },
    },
  })
);

type CREATE_TEAM__TYPE =
  | {
      teamCreate: CREATE_TEAM__DOC_TYPE;
    }
  | undefined;

type CREATE_TEAM__DOC_TYPE = {
  _id: string;
};

export { CREATE_TEAM };
export type { CREATE_TEAM__TYPE, CREATE_TEAM__DOC_TYPE };
