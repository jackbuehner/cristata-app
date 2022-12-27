import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Gets a team and its members
 */
const TEAM = gql(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        _id: 'ObjectID!',
      },
      team: {
        __args: {
          _id: new VariableType('_id'),
        },
        _id: true,
        name: true,
        slug: true,
        members: {
          _id: true,
          name: true,
          current_title: true,
          email: true,
          photo: true,
          flags: true,
          retired: true,
        },
        organizers: {
          _id: true,
          name: true,
          current_title: true,
          email: true,
          photo: true,
          flags: true,
          retired: true,
        },
      },
    },
  })
);

type TEAM__TYPE =
  | {
      team?: TEAM__DOC_TYPE;
    }
  | undefined;

type TEAM__DOC_TYPE = {
  _id: string;
  name: string;
  slug: string;
  members?: TEAM_USER__DOC_TYPE[];
  organizers?: TEAM_USER__DOC_TYPE[];
};

type TEAM_USER__DOC_TYPE = {
  _id: string;
  name: string;
  current_title: string;
  email: string;
  photo: string;
  flags: string[];
  retired?: boolean;
};

export { TEAM };
export type { TEAM__TYPE, TEAM__DOC_TYPE };
