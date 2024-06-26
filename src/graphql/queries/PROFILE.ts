import { parse } from 'graphql';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import type { Paged } from '../../interfaces/cristata/paged';
import { paged } from '../paged';

/**
 * Gets a full user profile.
 */
const PROFILE = parse(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        _id: 'ObjectID!',
      },
      profile: {
        __aliasFor: 'user',
        __args: {
          _id: new VariableType('_id'),
        },
        _id: true,
        name: true,
        phone: true,
        email: true,
        twitter: true,
        biography: true,
        current_title: true,
        timestamps: {
          created_at: true,
          modified_at: true,
          joined_at: true,
          left_at: true,
          last_login_at: true,
        },
        people: {
          created_by: {
            name: true,
          },
          last_modified_by: {
            name: true,
          },
        },
        photo: true,
        teams: {
          __args: {
            _id: new VariableType('_id'),
            limit: 100, // TODO: determine how to handle when a user has more than 100 teams
          },
          ...paged({
            _id: true,
            slug: true,
            name: true,
          }),
        },
        retired: true,
        slug: true,
        username: true,
        flags: true,
      },
    },
  })
);

type PROFILE__TYPE =
  | {
      profile?: PROFILE__DOC_TYPE;
    }
  | undefined;

type PROFILE__DOC_TYPE = {
  _id: string;
  name: string;
  phone?: number;
  email?: string;
  twitter?: string;
  biography?: string;
  current_title?: string;
  photo?: string;
  teams: Paged<{
    _id: string;
    slug: string;
    name: string;
  }>;
  timestamps: {
    created_at: string;
    modified_at: string;
    joined_at: string;
    left_at: string;
    last_login_at: string;
  };
  people: {
    created_by: { name: string };
    last_modified_by: { name: string };
  };
  retired?: boolean;
  slug: string;
  username?: string;
  flags: string[];
};

export { PROFILE };
export type { PROFILE__DOC_TYPE, PROFILE__TYPE };
