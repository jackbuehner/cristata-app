import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import mongoose from 'mongoose';
import { Paged } from '../../../interfaces/cristata/paged';
import { isObjectId } from '../../../utils/isObjectId';

async function selectProfile(inputValue: string, client: ApolloClient<NormalizedCacheObject>) {
  // get the five years that best match the current input
  type QueryDocType = { _id: mongoose.Types.ObjectId; name: string };
  const QUERY = (input: string) =>
    gql(
      jsonToGraphQLQuery({
        query: {
          users: {
            __args: {
              limit: 5,
              ...(isObjectId(input)
                ? { _ids: [input] }
                : { filter: JSON.stringify({ name: { $regex: input, $options: 'i' } }) }),
            },
            docs: {
              _id: true,
              name: true,
            },
          },
        },
      })
    );
  const { data } = await client.query<{ users: Paged<QueryDocType> }>({
    query: QUERY(inputValue),
    fetchPolicy: 'no-cache',
  });

  // with the user data, create the options array
  const options = data.users.docs.map((user) => ({
    value: new mongoose.Types.ObjectId(user._id).toHexString(),
    label: user.name,
  }));

  // return the opions array
  return options;
}

export { selectProfile };
