import { IShortURL } from '../../../interfaces/cristata/shorturl';
import { db } from '../../../utils/axios/db';
import { collection } from '../../collections';

const shorturl: collection<IShortURL> = {
  home: '/cms/collection/shorturls',
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
  row: { href: '/cms/item/shorturl', hrefSuffixKey: 'code' },
  isPublishable: false,
  canWatch: false,
  onTableData: (shorturls, users) => {
    /**
     * Find user in user data.
     */
    const findUserAndReturnObj = (userID: number) => {
      const user = users?.find((user) => user.github_id === userID);
      return user;
    };

    // change userIDs to user display names
    shorturls.forEach((shorturl) => {
      // format created by ids to names and photos
      if (typeof shorturl.people.created_by === 'number') {
        const user = findUserAndReturnObj(shorturl.people.created_by);
        if (user) {
          const { name, photo } = user;
          shorturl.people.created_by = { name, photo };
        }
      }
      // format last modified by ids to names and photos
      if (typeof shorturl.people.last_modified_by === 'number') {
        const user = findUserAndReturnObj(shorturl.people.last_modified_by);
        if (user) {
          const { name, photo } = user;
          shorturl.people.last_modified_by = { name, photo };
        }
      }
    });

    return shorturls;
  },
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
