import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import mongoose from 'mongoose';
import { Paged } from '../../../interfaces/cristata/paged';

async function selectPhotoPath(inputValue: string, client: ApolloClient<NormalizedCacheObject>) {
  // get the photos that best match the current input
  type QueryDocType = {
    _id: mongoose.Types.ObjectId;
    photo_url: string;
    name: string;
    people: { photo_created_by?: string };
  };
  const QUERY = (input: string) =>
    gql(
      jsonToGraphQLQuery({
        query: {
          photos: {
            __args: {
              limit: 10,
              filter: JSON.stringify({
                $or: [{ name: { $regex: input, $options: 'i' } }, { photo_url: input }],
              }),
            },
            docs: {
              _id: true,
              photo_url: true,
              name: true,
              people: {
                photo_created_by: true,
              },
            },
          },
        },
      })
    );
  const { data } = await client.query<{ photos: Paged<QueryDocType> }>({
    query: QUERY(inputValue),
    fetchPolicy: 'no-cache',
  });

  // with the photo data, create the options array
  const options = data.photos.docs.map((photo) => {
    const isDisabled = !photo.people.photo_created_by;
    return {
      value: photo.photo_url,
      label: `${photo.name} ${isDisabled ? `[MISSING PHOTOGRAPHER]` : ``}`,
      isDisabled: isDisabled,
    };
  });

  // return the options array
  return options;
}

export { selectPhotoPath };