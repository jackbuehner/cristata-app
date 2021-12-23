import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Gets a photo by _id.
 */
const PHOTO = gql(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        _id: 'ObjectID!',
      },
      photo: {
        __args: {
          _id: new VariableType('_id'),
        },
        _id: true,
        hidden: true,
        locked: true,
        name: true,
        tags: true,
        photo_url: true,
        people: {
          modified_by: {
            _id: true,
            name: true,
          },
          watching: {
            _id: true,
            name: true,
          },
          uploaded_by: {
            _id: true,
            name: true,
          },
          last_modified_by: {
            _id: true,
            name: true,
          },
          photo_created_by: true,
        },
        file_type: true,
        dimensions: {
          x: true,
          y: true,
        },
        timestamps: {
          created_at: true,
          modified_at: true,
        },
        permissions: {
          teams: true,
          users: {
            _id: true,
          },
        },
      },
    },
  })
);

type PHOTO__TYPE =
  | {
      photo: PHOTO__DOC_TYPE;
    }
  | undefined;

type PHOTO__DOC_TYPE = {
  _id: string;
  hidden: boolean;
  locked: boolean;
  name: string;
  tags: string[];
  photo_url: string;
  people: {
    modified_by: {
      _id: string;
      name: string;
    }[];
    watching: {
      _id: string;
      name: string;
    }[];
    uploaded_by: {
      _id: string;
      name: string;
    };
    last_modified_by: {
      _id: string;
      name: string;
    };
    photo_created_by: string;
  };
  file_type: string;
  dimensions: {
    x: number;
    y: number;
  };
  timestamps: {
    created_at: string; // ISO date
    modified_at: string; // ISO date
  };
  permissions: {
    teams: string[];
    users: number[];
  };
};

export { PHOTO };
export type { PHOTO__TYPE, PHOTO__DOC_TYPE };
