import { parse } from 'graphql';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import type { Paged } from '../../interfaces/cristata/paged';
import { paged } from '../paged';

/**
 * Gets some basic data about a collection of photos.
 */
const PHOTOS_BASIC = parse(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        limit: 'Int = 10',
        page: 'Int = 1',
        _ids: '[ObjectID]',
        filter: 'JSON',
        sort: 'JSON',
      },
      photos: {
        __args: {
          limit: new VariableType('limit'),
          page: new VariableType('page'),
          _ids: new VariableType('_ids'),
          filter: new VariableType('filter'),
          sort: new VariableType('sort'),
        },
        ...paged({
          _id: true,
          name: true,
          photo_url: true,
          tags: true,
          people: {
            photo_created_by: true,
          },
        }),
      },
    },
  })
);

type PHOTOS_BASIC__TYPE =
  | {
      photos: Paged<PHOTOS_BASIC__DOC_TYPE>;
    }
  | undefined;

type PHOTOS_BASIC__DOC_TYPE = {
  _id: string;
  name: string;
  photo_url: string;
  tags: string[];
  people: {
    photo_created_by: string;
  };
};

export { PHOTOS_BASIC };
export type { PHOTOS_BASIC__DOC_TYPE, PHOTOS_BASIC__TYPE };
