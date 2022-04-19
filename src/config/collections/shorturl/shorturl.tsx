import { gql } from '@apollo/client';
import { collection } from '../../collections';

const shorturl: collection = {
  createNew: ([loading, setIsLoading], client, toast, navigate, { state: modalState, modal }) => {
    const setModal = modalState[1];
    const showModal = modal[0];

    // show the modal
    showModal();

    // set the modal state
    setModal({
      // clear existing state
      state: {},

      // set the modal fields
      fields: [
        {
          type: 'text',
          key: 'original_url',
          label: 'Destination',
          required: true,
        },
      ],

      // set the create function
      create: (args) => {
        // requrire the original_url field to have a value
        if (args.original_url && typeof args.original_url === 'string' && args.original_url.length > 0) {
          // show the loading indicator
          setIsLoading(true);

          // attempt to create a new shorturl document
          client
            .mutate<{ shorturlCreate?: { code: string } }>({
              mutation: gql`
                mutation Create($original_url: String!, $code: String, $domain: String!) {
                  shorturlCreate(original_url: $original_url, code: $code, domain: $domain) {
                    code
                  }
                }
              `,
              variables: {
                // provide the shorturl destination
                original_url: args.original_url,
                // always use this domain since we do not have any other shorturl domains
                domain: 'flusher.page',
              },
            })
            .then(({ data }) => {
              // stop loading
              setIsLoading(false);
              // navigate to the new document upon successful creation
              navigate(`/cms/item/shorturl/${data?.shorturlCreate?.code}`);
            })
            .catch((err) => {
              // stop loading
              setIsLoading(false);
              // log and show the errors
              console.error(err);
              toast.error(`Failed to save changes. \n ${err.message}`);
            });
        } else {
          // tell user to specifiy the destination url
          toast.error(`You need to specify a destination URL.`);
        }
        // do not close the modal after clicking the 'Create' button
        // because it will close automatically when the page redirects
        // to the new document upon successful document creation
        return false;
      },
    });
  },
};

export { shorturl };
