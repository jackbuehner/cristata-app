import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { Paged } from '../../interfaces/cristata/paged';
import { isObjectId } from '../../utils/isObjectId';
import { paged } from '../paged';

/**
 * Gets some basic data about a collection of photos.
 *
 * This query exlcudes photos without photo credit
 */
const PHOTOS_BASIC_BY_REGEXNAME_OR_URL = (input: string) => {
  const isId = isObjectId(input);
  return gql(
    jsonToGraphQLQuery({
      query: {
        __variables: {
          limit: 'Int! = 10',
          page: 'Int = 1',
        },
        photos: {
          __args: {
            limit: new VariableType('limit'),
            page: new VariableType('page'),
            filter: JSON.stringify({
              // ensure that the photo creater string exists and is not null or undefined or empty string
              $and: [
                { 'people.photo_created_by': { $exists: true } },
                { 'people.photo_created_by': { $ne: null } },
                { 'people.photo_created_by': { $ne: '' } },
              ],
              // match by string included in name OR exact same URL (only if not an object Id [use _id arg instead])
              ...(isId
                ? undefined
                : { $or: [{ name: { $regex: input, $options: 'i' } }, { photo_url: input }] }),
            }),
            ...(isId ? { _ids: [input] } : undefined),
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
};

type PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE =
  | {
      photos: Paged<PHOTOS_BASIC_BY_REGEXNAME_OR_URL__DOC_TYPE>;
    }
  | undefined;

type PHOTOS_BASIC_BY_REGEXNAME_OR_URL__DOC_TYPE = {
  _id: string;
  name: string;
  photo_url: string;
  tags: string;
  people: {
    photo_created_by?: string;
  };
};

export { PHOTOS_BASIC_BY_REGEXNAME_OR_URL };
export type { PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE, PHOTOS_BASIC_BY_REGEXNAME_OR_URL__DOC_TYPE };
