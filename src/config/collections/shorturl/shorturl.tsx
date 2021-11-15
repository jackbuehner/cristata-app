import { IShortURL } from '../../../interfaces/cristata/shorturl';
import { db } from '../../../utils/axios/db';
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
  createNew: ([loading, setIsLoading], toast, history) => {
    setIsLoading(true);
    db.post(`/shorturl`)
      .then(({ data }) => {
        setIsLoading(false);
        history.push(`/cms/item/shorturl/${data.code}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

export { shorturl };
