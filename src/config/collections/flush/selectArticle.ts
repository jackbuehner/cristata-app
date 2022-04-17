import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import mongoose from 'mongoose';
import { Paged } from '../../../interfaces/cristata/paged';
import { isObjectId } from '../../../utils/isObjectId';

async function selectArticle(inputValue: string, client: ApolloClient<NormalizedCacheObject>) {
  // get the articles that best match the current input
  type QueryDocType = { _id: mongoose.Types.ObjectId; name: string };
  const QUERY = (input: string) =>
    gql(
      jsonToGraphQLQuery({
        query: {
          articles: {
            __args: {
              limit: 10,
              ...(isObjectId(input)
                ? { _ids: [input], filter: JSON.stringify({ stage: { $gt: 5 } }) }
                : {
                    filter: JSON.stringify({
                      $and: [
                        { stage: { $gt: 5 } },
                        {
                          $or: [{ name: { $regex: input, $options: 'i' } }],
                        },
                      ],
                    }),
                  }),
            },
            docs: {
              _id: true,
              name: true,
            },
          },
        },
      })
    );
  const { data } = await client.query<{ articles: Paged<QueryDocType> }>({
    query: QUERY(inputValue),
    fetchPolicy: 'no-cache',
  });

  // with the photo data, create the options array
  const options = data.articles.docs.map((article) => {
    const objectIdHex = new mongoose.Types.ObjectId(article._id).toHexString();
    return {
      value: objectIdHex,
      label: `${article.name} (${objectIdHex.slice(-7, objectIdHex.length)})`,
    };
  });

  // return the options array
  return options;
}

export { selectArticle };
