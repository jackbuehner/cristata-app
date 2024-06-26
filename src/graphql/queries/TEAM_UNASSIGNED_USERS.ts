import { parse } from 'graphql';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

/**
 * Gets the list of active users who are not assigned to a team.
 *
 * Active users are users who are not hidden and are not retired.
 */
const TEAM_UNASSIGNED_USERS = parse(
  jsonToGraphQLQuery({
    query: {
      teamUnassignedUsers: {
        _id: true,
        name: true,
        current_title: true,
        email: true,
        photo: true,
        flags: true,
      },
    },
  })
);

type TEAM_UNASSIGNED_USERS__TYPE =
  | {
      teamUnassignedUsers: TEAM_UNASSIGNED_USERS__DOC_TYPE[];
    }
  | undefined;

type TEAM_UNASSIGNED_USERS__DOC_TYPE = {
  _id: string;
  name: string;
  current_title: string;
  email: string;
  photo: string;
  flags: string[];
};

export { TEAM_UNASSIGNED_USERS };
export type { TEAM_UNASSIGNED_USERS__DOC_TYPE, TEAM_UNASSIGNED_USERS__TYPE };
