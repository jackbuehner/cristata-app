import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import mongoose from 'mongoose';
import { Paged } from '../../../interfaces/cristata/paged';
import { isObjectId } from '../../../utils/isObjectId';

async function selectTeam(inputValue: string, client: ApolloClient<NormalizedCacheObject>) {
  // get the five teams that best match
  type QueryDocType = {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  };
  const QUERY = (input: string) =>
    gql(
      jsonToGraphQLQuery({
        query: {
          teams: {
            __args: {
              limit: 5,
              ...(isObjectId(input)
                ? { _ids: [input] }
                : { filter: JSON.stringify({ name: { $regex: input, $options: 'i' } }) }),
            },
            docs: {
              _id: true,
              name: true,
              slug: true,
            },
          },
        },
      })
    );
  const { data } = await client.query<{ teams: Paged<QueryDocType> }>({
    query: QUERY(inputValue),
    fetchPolicy: 'no-cache',
  });

  // with the teams data, create the options array
  const options = data.teams.docs.map((team) => {
    return {
      value: new mongoose.Types.ObjectId(team._id).toHexString(),
      label: team.name,
    };
  });

  // return the options array
  return options;
}

export { selectTeam };
