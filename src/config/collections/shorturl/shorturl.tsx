import { gql } from '@apollo/client';
import { IShortURL } from '../../../interfaces/cristata/shorturl';
import { collection } from '../../collections';

const shorturl: collection<IShortURL> = {
  home: '/cms/collection/shorturls',
  query: {
    name: {
      singular: 'shorturl',
      plural: 'shorturls',
    },
    identifier: 'code',
  },
  fields: [
    {
      key: 'original_url',
      label: 'Destination URL',
      type: 'text',
      description: 'The short URL will redirect to this URL.',
    },
    {
      key: 'domain',
      label: 'Domain',
      type: 'select',
      description: 'The domain for the short url.',
      options: [{ value: 'flusher.page', label: 'flusher.page' }],
    },
    {
      key: 'code',
      label: 'Short URL code',
      type: 'text',
      description: 'The code for the short url.',
      isDisabled: true,
    },
    { key: 'timestamps.created_at', label: 'Created at', type: 'datetime', isDisabled: true },
    { key: 'timestamps.modified_at', label: 'Modified at', type: 'datetime', isDisabled: true },
  ],
  columns: [
    {
      key: 'code',
      label: 'Code',
      width: 100,
    },
    {
      key: 'domain',
      label: 'Short URL',
      render: (data) => {
        return (
          <span>
            https://{data.domain}/{data.code}
          </span>
        );
      },
      width: 250,
    },
    { key: 'original_url', label: 'Destination', width: 350 },
    { key: 'hidden', label: 'hidden', filter: 'excludes', width: 1 },
  ],
  row: { href: '/cms/item/shorturl', hrefSuffixKey: 'code' },
  isPublishable: false,
  canWatch: false,
  pageTitle: () => 'Short URLs',
  pageDescription: () => 'Generate short URLs that redirect to other pages.',
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
