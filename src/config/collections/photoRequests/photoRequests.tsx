import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { collection } from '../../collections';

const photoRequests: collection = {
  createNew: ([loading, setIsLoading], client, toast, navigate) => {
    setIsLoading(true);

    const CREATE_NEW_PHOTO_REQUEST = gql(
      jsonToGraphQLQuery({
        mutation: {
          __name: 'photoRequestCreate',
          __variables: {
            name: 'String!',
          },
          photoRequestCreate: {
            __args: {
              name: new VariableType('name'),
            },
            _id: true,
          },
        },
      })
    );

    client
      .mutate({
        mutation: CREATE_NEW_PHOTO_REQUEST,
        variables: {
          name: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: '-',
          }),
        },
      })
      .then(({ data }) => {
        setIsLoading(false);
        navigate(`/cms/collection/photo-requests/${data.photoRequestCreate._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

export { photoRequests };
