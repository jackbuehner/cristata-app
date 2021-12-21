import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import mongoose from 'mongoose';
import { Paged } from '../../../interfaces/cristata/paged';

async function selectProfile(inputValue: string, client: ApolloClient<NormalizedCacheObject>) {
  // get the five years that best match the current input
  type QueryDocType = { _id: mongoose.Types.ObjectId; github_id: string; name: string };
  const QUERY = (input: string) =>
    gql(
      jsonToGraphQLQuery({
        query: {
          users: {
            __args: {
              limit: 5,
              filter: JSON.stringify({
                $or: [
                  { name: { $regex: input, $options: 'i' } },
                  { _id: { $in: inputValue.split('; ') } },
                  { github_id: { $in: input.split('; ').map((github_id) => parseInt(github_id)) } },
                ],
              }),
            },
            docs: {
              _id: true,
              github_id: true,
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
  const options = data.users.docs.map((user) => ({ value: user.github_id, label: user.name }));

  // return the opions array
  return options;
}

export { selectProfile };
