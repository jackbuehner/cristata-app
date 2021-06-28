import { IProfile } from './interfaces/cristata/profiles';
import { IGetTeams } from './interfaces/github/teams';
import { db } from './utils/axios/db';
import { Chip } from './components/Chip';
import { colorType } from './utils/theme/theme';
import { DateTime } from 'luxon';

interface Icollections {
  [key: string]:
    | {
        fields: Array<{
          key: string;
          label?: string; // fall back to name if not provided
          type: string;
          description?: string;
          tiptap?: tiptapOptions;
          options?: Array<{
            value: string;
            label: string;
          }>;
          isDisabled?: boolean;
          async_options?: (inputValue: string) => Promise<Array<{ value: string; label: string }>>;
        }>;
        columns: Array<{
          key: string;
          label?: string;
          width?: number;
          render?: (data: { [key: string]: any }) => React.ReactElement;
          filter?: string;
          isSortable?: false;
        }>;
      }
    | undefined;
}

interface tiptapOptions {
  type: string;
  keys_article?: {
    headline: string;
    description: string;
    categories: string;
    caption: string;
  };
}

const collections: Icollections = {
  articles: {
    fields: [
      { key: 'name', label: 'Headline', type: 'text', description: 'The title of the article.' },
      {
        key: 'description',
        label: 'Summary',
        type: 'text',
        description:
          'A short summary or message related to the article that will draw in the reader. This appears on most article cards and on social media.',
      },
      {
        key: 'stage',
        label: 'Stage',
        type: 'select',
        description: 'The current status of this article.',
        options: [
          { value: '1.1', label: 'Planning' },
          { value: '2.1', label: 'Draft' },
          { value: '3.1', label: 'Pending Editor Review' },
          { value: '3.3', label: 'Pending Copy Edit' },
          { value: '3.5', label: 'Pending Writer/Editor Check' },
          { value: '4.1', label: 'Pending Upload Approval' },
          { value: '5.1', label: 'Uploaded/Scheduled' },
          { value: '5.2', label: 'Published' },
        ],
      },
      {
        key: 'categories',
        label: 'Sections',
        type: 'multiselect',
        description: 'The sections in which this article belongs.',
        options: [
          { value: 'news', label: 'News' },
          { value: 'opinion', label: 'Opinions' },
          { value: 'sports', label: 'Sports' },
          { value: 'diversity', label: 'Diversity Matters' },
          { value: 'arts', label: 'Arts' },
          { value: 'campus-culture', label: 'Campus & Culture' },
        ],
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'multiselect_creatable',
        description: 'Keywords and tags that apply to this article. Allows custom entries.',
      },
      {
        key: 'photo_path',
        label: 'Photo',
        type: 'text',
        description:
          'The photo that appears at the top of every article and in most article cards. NOT IMPLIMENTED.',
        isDisabled: true,
      },
      {
        key: 'photo_caption',
        label: 'Photo caption',
        type: 'text',
        description:
          'The caption for the photo. It should be relevant to the photo. Not every photo needs a caption.',
      },
      {
        key: 'people.authors',
        label: 'Byline',
        type: 'multiselect_async',
        description: 'The authors that appear on the byline.',
        async_options: async (inputValue: string) => {
          // get all users
          const { data: users }: { data: IProfile[] } = await db.get(`/users`);

          // with the user data, create the options array
          let options: Array<{ value: string; label: string }> = [];
          users.forEach((user) => {
            options.push({
              value: `${user.github_id}`,
              label: user.name,
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
        key: 'people.editors.primary',
        label: 'Section editors',
        type: 'multiselect_async',
        description: 'The managing editors responsible for this article.',
        async_options: async (inputValue: string) => {
          // get all users
          const { data: users }: { data: IProfile[] } = await db.get(`/users`);

          // with the user data, create the options array
          let options: Array<{ value: string; label: string }> = [];
          users.forEach((user) => {
            options.push({
              value: `${user.github_id}`,
              label: user.name,
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
        key: 'people.editors.copy',
        label: 'Copy editors',
        type: 'multiselect_async',
        description: 'The copy editors who have made edits to this article.',
        async_options: async (inputValue: string) => {
          // get all users
          const { data: users }: { data: IProfile[] } = await db.get(`/users`);

          // with the user data, create the options array
          let options: Array<{ value: string; label: string }> = [];
          users.forEach((user) => {
            options.push({
              value: `${user.github_id}`,
              label: user.name,
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
        key: 'body',
        label: 'Body',
        type: 'tiptap',
        tiptap: {
          type: 'article',
          keys_article: {
            headline: 'name',
            description: 'description',
            categories: 'categories',
            caption: 'photo_caption',
          },
        },
      },
      {
        key: 'locked',
        label: 'Locked status',
        type: 'boolean',
        description: 'Control whether this article is able to be modified. NOT IMPLIMENTED.',
        isDisabled: true,
      },
      {
        key: 'permissions.users',
        label: 'User access control',
        type: 'multiselect_async',
        description: 'Control which users can see this article.',
        async_options: async (inputValue: string) => {
          // get all users
          const { data: users }: { data: IProfile[] } = await db.get(`/users`);

          // with the user data, create the options array
          let options: Array<{ value: string; label: string }> = [];
          users.forEach((user) => {
            options.push({
              value: `${user.github_id}`,
              label: user.name,
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
        key: 'permissions.teams',
        label: 'Team access control',
        type: 'multiselect_async',
        description: 'Control which teams (user groups) can see this article.',
        async_options: async (inputValue: string) => {
          // get all teams
          const { data: teamsData }: { data: IGetTeams } = await db.get(`/gh/teams`);

          // with the teams data, create the options array
          let options: Array<{ value: string; label: string }> = [];
          teamsData.organization.teams.edges.forEach((team) => {
            options.push({
              value: `${team.node.id}`,
              label: team.node.slug,
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
      { key: 'timestamps.target_publish_at', label: 'Target publish date and time', type: 'datetime' },
      { key: 'timestamps.created_at', label: 'Created at', type: 'datetime', isDisabled: true },
      { key: 'timestamps.modified_at', label: 'Modified at', type: 'datetime', isDisabled: true },
      { key: 'timestamps.published_at', label: 'Published at', type: 'datetime', isDisabled: true },
    ],
    columns: [
      { key: 'name', label: 'Headline', width: 350 },
      {
        key: 'stage',
        label: 'Stage',
        render: (data) => {
          enum Stage {
            'Planning' = 1.1,
            'Draft' = 2.1,
            'Editor Review' = 3.1,
            'Copy Edit' = 3.3,
            'Writer/Editor Check' = 3.5,
            'Upload Approval' = 4.1,
            'Uploaded/Scheduled' = 5.1,
            'Published' = 5.2,
          }
          const Color: { [key: number]: colorType } = {
            1.1: 'neutral',
            2.1: 'neutral',
            3.1: 'orange',
            3.3: 'indigo',
            3.5: 'orange',
            4.1: 'red',
            5.1: 'blue',
            5.2: 'green',
          };

          return <Chip label={Stage[data.stage]} color={Color[data.stage] || 'neutral'} />;
        },
        filter: 'excludes',
        isSortable: false,
      },
      {
        key: 'people.authors',
        label: 'Authors',
        render: (data) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
            {data.people?.authors?.map((author: { name: string; photo?: string }, index: number) => {
              const { name, photo } = author;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img
                    src={photo}
                    alt={``}
                    style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid lightgray' }}
                  />
                  <span style={{ fontSize: 14 }}>{name}</span>
                </div>
              );
            })}
          </div>
        ),
        isSortable: false,
      },
      {
        key: 'categories',
        label: 'Sections',
        render: (data) => {
          const categories: { [key: string]: string } = {
            news: 'News',
            opinion: 'Opinion',
            sports: 'Sports',
            diversity: 'Diversity Matters',
            arts: 'Arts',
            'campus-culture': 'Campus & Culture',
          };
          return (
            <div>
              {data.categories?.map((category: string, index: number) => {
                if (category === '') return '';
                return <Chip key={index} label={categories[category] || category} />;
              })}
            </div>
          );
        },
        width: 180,
        filter: 'includes',
        isSortable: false,
      },
      {
        key: 'tags',
        label: 'Tags',
        render: (data) => (
          <div>
            {data.tags?.map((tag: string, index: number) => {
              if (tag === '') return '';
              return <Chip key={index} label={tag} />;
            })}
          </div>
        ),
        width: 180,
        isSortable: false,
      },
      {
        key: 'timestamps.target_publish_at',
        label: 'Target date',
        render: (data) => {
          const date = DateTime.fromISO(data.timestamps?.target_publish_at).toFormat(`LLL. dd, yyyy`);
          if (date === '31 December 0000') return <span></span>; // this is the default date

          const isLate =
            DateTime.fromISO(data.timestamps?.target_publish_at) < DateTime.now() && data.stage < 5;
          const isIn24hrs =
            DateTime.fromISO(data.timestamps?.target_publish_at) < DateTime.fromMillis(Date.now() + 86400000) &&
            data.stage < 5; // one day in advance
          const isSoon =
            DateTime.fromISO(data.timestamps?.target_publish_at) <
              DateTime.fromMillis(Date.now() + 259200000) && data.stage < 5; // three days in advance

          return (
            <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              {date}
              {isLate ? (
                <Chip label={`Late`} color={`red`} />
              ) : isIn24hrs ? (
                <Chip label={`24 hours`} color={`orange`} />
              ) : isSoon ? (
                <Chip label={`Soon`} color={`neutral`} />
              ) : null}
            </div>
          );
        },
        width: 174,
        isSortable: false,
      },
      {
        key: 'people.created_by',
        label: 'Created by',
        render: (data) => {
          const { name, photo } = data.people?.created_by;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={photo}
                alt={``}
                style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid lightgray' }}
              />
              <span style={{ fontSize: 14 }}>{name}</span>
            </div>
          );
        },
        isSortable: false,
      },
      {
        key: 'people.last_modified_by',
        label: 'Last modified by',
        render: (data) => {
          const { name, photo } = data.people?.last_modified_by;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={photo}
                alt={``}
                style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid lightgray' }}
              />
              <span style={{ fontSize: 14 }}>{name}</span>
            </div>
          );
        },
        isSortable: false,
      },
      {
        key: 'timestamps.modified_at',
        label: 'Last modified',
        render: (data) => {
          return (
            <div style={{ fontSize: 14 }}>
              {DateTime.fromISO(data.timestamps?.modified_at).toFormat(`LLL. dd, yyyy`)}
            </div>
          );
        },
        isSortable: false,
      },
    ],
  },
};

export { collections };
export type { tiptapOptions };
