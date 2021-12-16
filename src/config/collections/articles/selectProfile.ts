import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import mongoose from 'mongoose';
import { Paged } from '../../../interfaces/cristata/paged';

// TODO: Switch to GraphQL API

async function selectProfile(inputValue: string, client: ApolloClient<NormalizedCacheObject>) {
  // get the five years that best match the current input
  type QueryDocType = { _id: mongoose.Types.ObjectId; github_id: string; name: string };
  const QUERY = (name: string) =>
    gql(
      jsonToGraphQLQuery({
        query: {
          users: {
            __args: {
              limit: 5,
              filter: JSON.stringify({
                $or: [{ name: { $regex: name, $options: 'i' } }, { _id: { $in: inputValue.split('; ') } }],
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
  });

  // with the user data, create the options array
  return data.users.docs.map((user) => ({ value: user.github_id, label: user.name }));
}

export { selectProfile };
