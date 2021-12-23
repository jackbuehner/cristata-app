import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Gets a full user profile.
 */
const PROFILE = gql(
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
        photo: true,
        teams: {
          docs: {
            _id: true,
            slug: true,
            name: true,
          },
        },
      },
    },
  })
);

type PROFILE__TYPE =
  | {
      profile: PROFILE__DOC_TYPE;
    }
  | undefined;

type PROFILE__DOC_TYPE = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  twitter?: string;
  biography?: string;
  current_title?: string;
  photo?: string;
  teams: {
    docs: Array<{
      _id: string;
      slug: string;
      name: string;
    }>;
  };
  timestamps: {
    created_at: string;
    modified_at: string;
    joined_at: string;
    left_at: string;
    last_login_at: string;
  };
};

export { PROFILE };
export type { PROFILE__TYPE, PROFILE__DOC_TYPE };
