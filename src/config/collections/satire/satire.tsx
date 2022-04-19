import { gql } from '@apollo/client';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { collection } from '../../collections';

const satire: collection = {
  createNew: ([loading, setIsLoading], client, toast, navigate) => {
    setIsLoading(true);
    client
      .mutate<{ satireCreate?: { _id: string } }>({
        mutation: gql`
          mutation Create($name: String!) {
            satireCreate(name: $name) {
              _id
            }
          }
        `,
        variables: {
          // generate a document name
          name: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: '-',
          }),
        },
      })
      .then(({ data }) => {
        setIsLoading(false);
        // navigate to the new document upon successful creation
        navigate(`/cms/collection/satire/${data?.satireCreate?._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

export { satire };
