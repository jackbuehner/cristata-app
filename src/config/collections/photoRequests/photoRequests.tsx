import { Chip } from '../../../components/Chip';
import { IPhotoRequest } from '../../../interfaces/cristata/photoRequests';
import { IProfile } from '../../../interfaces/cristata/profiles';
import { db } from '../../../utils/axios/db';
import { colorType } from '../../../utils/theme/theme';
import { collection } from '../../collections';
import { selectProfile } from '../articles/selectProfile';
import { selectTeam } from '../articles/selectTeam';

const photoRequests: collection<IPhotoRequest> = {
  home: '/cms/photos/requests',
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
      label: 'Requester',
      type: 'select_async',
      description: 'This person will be contacted if the photo team has questions about the request.',
      async_options: (val) => selectProfile(val),
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
      filter: 'excludes',
      sortType: (rowA, rowB, columnId) => {
        /**
         * Sort the column by stage. This is a specialized function that retrieves the stage number
         * from the react div component.
         *
         * @returns 1 if rowA stage is ahead of rowB stage, -1 if rowB is ahead of rowA, 0 if equal
         */
        const stageA = rowA.values[columnId].props['data-number'];
        const stageB = rowB.values[columnId].props['data-number'];
        if (stageA > stageB) return 1;
        else if (stageB > stageA) return -1;
        return 0;
      },
    },
    {
      key: 'people.requested_by',
      label: 'Requested by',
      render: (data) => {
        if (data.people?.requested_by) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={data.people.requested_by.photo}
                alt={``}
                style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid lightgray' }}
              />
              <span style={{ fontSize: 14 }}>{data.people.requested_by.name}</span>
            </div>
          );
        }
        return <span></span>;
      },
      isSortable: false,
    },
    { key: 'hidden', label: 'hidden', filter: 'excludes', width: 1 },
  ],
  isPublishable: false,
};

export { photoRequests };
