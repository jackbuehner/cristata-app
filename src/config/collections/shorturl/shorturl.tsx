import { collection } from '../../collections';

const shorturl: collection = {
  home: '/cms/shorturls',
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
      key: 'short_url',
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
  isPublishable: false,
  canWatch: false,
};

export { shorturl };
