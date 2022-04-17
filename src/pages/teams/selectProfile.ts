import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import mongoose from 'mongoose';
import { Paged } from '../../interfaces/cristata/paged';
import { getPasswordStatus } from '../../utils/axios/getPasswordStatus';
import { isObjectId } from '../../utils/isObjectId';

async function selectProfile(inputValue: string, client: ApolloClient<NormalizedCacheObject>) {
  // get the five years that best match the current input
  type QueryDocType = {
    _id: mongoose.Types.ObjectId;
    name: string;
    retired?: boolean;
    flags: string[];
    slug: string;
  };
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
              slug: true,
              retired: true,
              flags: true,
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
  const options = data.users.docs.map((user) => {
    const { temporary, expired } = getPasswordStatus(user.flags);

    return {
      value: new mongoose.Types.ObjectId(user._id).toHexString(),
      label:
        user.name +
        ` (${user.slug})` +
        (user.retired
          ? ' [DEACTIVATED/RETIRED]'
          : expired
          ? ' [INVITE IGNORED]'
          : temporary
          ? ' [PENDING INVITE]'
          : ''),
    };
  });

  // return the opions array
  return options;
}

export { selectProfile };
