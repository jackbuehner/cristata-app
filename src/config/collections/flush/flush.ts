import { gql } from '@apollo/client';
import { collection } from '../../collections';

const flush: collection = {
  createNew: ([loading, setIsLoading], client, toast, navigate) => {
    setIsLoading(true);
    client
      .mutate<{ flushCreate?: { _id: string } }>({
        mutation: gql`
          mutation Create($volume: Int!, $issue: Int!) {
            flushCreate(volume: $volume, issue: $issue) {
              _id
            }
          }
        `,
        variables: {
          volume: 99,
          issue: 99,
        },
      })
      .then(({ data }) => {
        setIsLoading(false);
        // navigate to the new document upon successful creation
        navigate(`/cms/item/flush/${data?.flushCreate?._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

export { flush };
