import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { Chip } from '../../../components/Chip';
import { mongoFilterType } from '../../../graphql/client';
import { IPhotoRequest } from '../../../interfaces/cristata/photoRequests';
import { IProfile } from '../../../interfaces/cristata/profiles';
import { db } from '../../../utils/axios/db';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType } from '../../../utils/theme/theme';
import { collection } from '../../collections';
import { selectProfile } from '../articles/selectProfile';
import { selectTeam } from '../articles/selectTeam';

const photoRequests: collection<IPhotoRequest> = {
  home: '/cms/collection/photo-requests',
  query: {
    name: {
      singular: 'photoRequest',
      plural: 'photoRequests',
    },
    identifier: '_id',
    force: ['hidden'],
  },
  fields: [
    { key: 'name', label: 'Request', type: 'text', description: 'A description of the needed photo.' },
    {
      key: 'stage',
      label: 'Stage',
      type: 'select',
      description: 'The current status of this request.',
      options: [
        { value: '1.1', label: 'New' },
        { value: '2.1', label: 'In-progress' },
        { value: '3.1', label: 'Fullfilled' },
      ],
    },
    {
      key: 'article_id',
      label: 'Relevant article',
      type: 'select_async',
      description: 'The article in need of this photo.',
      async_options: async (inputValue: string) => {
        // get all articles
        const { data: articles }: { data: IProfile[] } = await db.get(`/articles`);

        // with the article data, create the options array
        let options: Array<{ value: string; label: string }> = [];
        articles.forEach((article) => {
          options.push({
            value: `${article._id}`,
            label: article.name,
          });
        });

        // filter the options based on `inputValue`
        const filteredOptions = options.filter((option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        );

        // return the filtered options
        return filteredOptions;
      },
    },
    {
      key: 'people.requested_by',
      subfield: 'github_id',
      label: 'Requester',
      type: 'select_async',
      description: 'This person will be contacted if the photo team has questions about the request.',
      async_options: (val) => selectProfile(val),
      dataType: 'number',
      modifyValue: (val, data) => `${data['people.requested_by.github_id']}`,
    },
    {
      key: 'permissions.users',
      label: 'User access control',
      type: 'multiselect_async',
      description: 'Control which users can see this photo request.',
      async_options: (val) => selectProfile(val),
      dataType: 'number',
    },
    {
      key: 'permissions.teams',
      label: 'Team access control',
      type: 'multiselect_async',
      description: 'Control which teams can see this photo request.',
      async_options: (val) => selectTeam(val),
    },
    { key: 'timestamps.created_at', label: 'Created at', type: 'datetime', isDisabled: true },
    { key: 'timestamps.modified_at', label: 'Modified at', type: 'datetime', isDisabled: true },
  ],
  columns: [
    { key: 'name', label: 'Request', width: 350 },
    {
      key: 'stage',
      label: 'Stage',
      render: (data) => {
        enum Stage {
          'New' = 1.1,
          'In-progress' = 2.1,
          'Fulfilled' = 3.1,
        }
        const Color: { [key: number]: colorType } = {
          1.1: 'red',
          2.1: 'orange',
          3.1: 'green',
        };

        return (
          <Chip label={Stage[data.stage]} color={Color[data.stage] || 'neutral'} data-number={data.stage} />
        );
      },
      width: 100,
    },
    {
      key: 'people.requested_by',
      label: 'Requested by',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people?.requested_by) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={
                  data.people.requested_by.photo
                    ? data.people.requested_by.photo
                    : data.people.requested_by._id
                    ? genAvatar(data.people.requested_by._id)
                    : null
                }
                alt={``}
                style={{ width: 20, height: 20, borderRadius: 2 }}
              />
              <span style={{ fontSize: 14 }}>{data.people.requested_by.name}</span>
            </div>
          );
        }
        return <span></span>;
      },
      isSortable: false,
    },
  ],
  row: { href: '/cms/item/photo-requests', hrefSuffixKey: '_id' },
  isPublishable: false,
  pageTitle: () => `Photo requests`,
  pageDescription: () => `If a photo you need is not in the photo library, make a request here.`,
  tableDataFilter: (progress) => {
    // set a filter object
    const filter: mongoFilterType = { hidden: { $ne: true } };

    // modify filter based on the progress
    if (progress === 'unfulfilled') filter.stage = { $nin: [3.1] };

    return filter;
  },
  createNew: ([loading, setIsLoading], toast, history) => {
    setIsLoading(true);
    db.post(`/photo-requests`, {
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
      }),
    })
      .then(({ data }) => {
        setIsLoading(false);
        history.push(`/cms/item/photo-requests/${data._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

export { photoRequests };
