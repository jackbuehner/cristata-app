import { IProfile } from './interfaces/cristata/profiles';
import { IGetTeams } from './interfaces/github/teams';
import { IPhoto } from './interfaces/cristata/photos';
import { db } from './utils/axios/db';
import { Chip } from './components/Chip';
import { colorType } from './utils/theme/theme';
import { DateTime } from 'luxon';
import { ImageSearch24Regular, News24Regular, PersonBoard24Regular } from '@fluentui/react-icons';
import { AxiosResponse } from 'axios';

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
            isDisabled?: boolean;
          }>;
          isDisabled?: boolean;
          dataType?: string;
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
        isPublishable?: boolean;
        publishStage?: number;
        home: string;
      }
    | undefined;
}

interface tiptapOptions {
  type: string;
  isHTMLkey?: string;
  keys_article?: {
    headline: string;
    description: string;
    categories: string;
    caption: string;
    photo_url: string;
    authors: string;
    target_publish_at: string;
  };
}

const collections: Icollections = {
  articles: {
    home: '/cms/articles/in-progress',
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
          { value: '5.1', label: 'Uploaded/Scheduled', isDisabled: true },
          { value: '5.2', label: 'Published', isDisabled: true },
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
        type: 'select_async',
        description: 'The photo that appears at the top of every article and in most article cards.',
        async_options: async (inputValue: string) => {
          // get all photos
          const { data: photos }: { data: IPhoto[] } = await db.get(`/photos`);

          // with the data, create the options array
          let options: Array<{ value: string; label: string }> = [];
          photos.forEach((photo) => {
            options.push({
              value: photo.photo_url,
              label: photo.name || photo._id,
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
        dataType: 'number',
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
        dataType: 'number',
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
        dataType: 'number',
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
            photo_url: 'photo_path',
            authors: 'people.authors',
            target_publish_at: 'timestamps.target_publish_at',
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
        dataType: 'number',
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
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date

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
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={data.people?.created_by?.photo}
                alt={``}
                style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid lightgray' }}
              />
              <span style={{ fontSize: 14 }}>{data.people?.created_by?.name}</span>
            </div>
          );
        },
        isSortable: false,
      },
      {
        key: 'people.last_modified_by',
        label: 'Last modified by',
        render: (data) => {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={data.people?.last_modified_by?.photo}
                alt={``}
                style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid lightgray' }}
              />
              <span style={{ fontSize: 14 }}>{data.people?.last_modified_by?.name}</span>
            </div>
          );
        },
        isSortable: false,
      },
      {
        key: 'timestamps.modified_at',
        label: 'Last modified',
        render: (data) => {
          const date = DateTime.fromISO(data.timestamps?.modified_at).toFormat(`LLL. dd, yyyy`);
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date
          return <div style={{ fontSize: 14 }}>{date}</div>;
        },
        isSortable: false,
      },
      { key: 'hidden', label: 'hidden', filter: 'excludes', width: 1 },
    ],
    isPublishable: true,
    publishStage: 5.2,
  },
  photoRequests: {
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
        key: 'permissions.users',
        label: 'User access control',
        type: 'multiselect_async',
        description: 'Control which users can see this photo request.',
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
        description: 'Control which teams can see this photo request.',
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
        dataType: 'number',
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

          return <Chip label={Stage[data.stage]} color={Color[data.stage] || 'neutral'} />;
        },
        width: 100,
        filter: 'excludes',
        isSortable: false,
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
  },
  photos: {
    home: '/cms/photos/library',
    fields: [
      { key: 'name', label: 'Name', type: 'text', description: 'The name of the photo in the CMS.' },
      {
        key: 'people.photo_created_by',
        label: 'Source',
        type: 'text',
        description:
          'The photographer or artist of the photo. Be sure to credit the photographer/artist appropriately and correctly.\n\n <b>Guidelines</b>\n <i>Staff photographers</i>: Photographer/The Paladin \n <i>Freelance or club photographers</i>: Photographer for The Paladin \n <i>Purchased photos</i>: Photographer \n <i>Free photos with permission</i>: Courtesy of Photographer \n <i>Photos from AP, Getty photos, Flikr, etc.</i>: Photographer/Organization \n <i>Photos from Unsplash</i>: Photographer \\\\ Unsplash \n <i>Images from photo sites that are credited as "uncredited"</i>: Organization \n <i>Photos from Furman News</i>: Determine the actual source of the photo \n\n <b>Other notes</b> \n Do not use a photo if you are not 100% sure we can legally use it. Familiarize yourself with <a href="https://creativecommons.org/about/cclicenses/">the different Creative Commons licenses</a>. \n\n <b>Helpful resources</b> \n <a href="https://search.creativecommons.org/">Creative Commons content search</a> \n <a href="https://www.pexels.com/creative-commons-images/">Pexels Creative Commons Images</a> \n <a href="https://www.flickr.com/creativecommons/">Flikr Creative Commons explore page</a> \n <a href="https://unsplash.com/images/stock/creative-common">Unsplash Creative Commons Images</a> \n\n',
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'multiselect_creatable',
        description: 'Keywords related to the photo. Allows easier searching for photos.',
      },
    ],
    columns: [],
  },
  satire: {
    home: '/cms/satire/in-progress',
    fields: [
      { key: 'name', label: 'Headline', type: 'text', description: 'The title of the satire.' },
      {
        key: 'description',
        label: 'Summary',
        type: 'text',
        description:
          'A short summary or message related to the piece of satire that will draw in the reader. This appears on most cards and on social media.',
      },
      {
        key: 'stage',
        label: 'Stage',
        type: 'select',
        description: 'The current status of this article.',
        options: [
          { value: '1.1', label: 'Planning' },
          { value: '2.1', label: 'Draft' },
          { value: '3.3', label: 'Pending Copy Edit' },
          { value: '4.1', label: 'Pending Upload Approval' },
          { value: '5.1', label: 'Uploaded/Scheduled', isDisabled: true },
          { value: '5.2', label: 'Published', isDisabled: true },
        ],
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'multiselect_creatable',
        description: 'Keywords and tags that apply to this piece. Allows custom entries.',
      },
      {
        key: 'photo_path',
        label: 'Photo',
        type: 'select_async',
        description: 'The photo that appears at the top of the piece.',
        async_options: async (inputValue: string) => {
          // get all photos
          const { data: photos }: { data: IPhoto[] } = await db.get(`/photos`);

          // with the data, create the options array
          let options: Array<{ value: string; label: string }> = [];
          photos.forEach((photo) => {
            options.push({
              value: photo.photo_url,
              label: photo.name || photo._id,
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
        key: 'photo_caption',
        label: 'Photo caption',
        type: 'text',
        description: 'The caption for the photo. Not every photo needs a caption.',
      },
      {
        key: 'photo_credit',
        label: 'Photo credit',
        type: 'text',
        description: 'A funny photo credit.',
      },
      {
        key: 'people.display_authors',
        label: 'Display byline',
        type: 'multiselect_creatable',
        description:
          'The names that should appear on the byline. For satire, these should be funny or clever names that fit the piece. Allows custom entries.',
      },
      {
        key: 'people.authors',
        label: 'Authors',
        type: 'multiselect_async',
        description: 'The authors of this piece of satire. These names do not appear on the website.',
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
        dataType: 'number',
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
        dataType: 'number',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'tiptap',
        tiptap: {
          type: 'satire',
          isHTMLkey: 'legacy_html',
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
        dataType: 'number',
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
            'Pending Edit' = 3.3,
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
        key: 'people.display_authors',
        label: 'Display authors',
        render: (data) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
            {data.people?.display_authors?.map((author: { name: string }, index: number) => {
              const { name } = author;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{name}</span>
                </div>
              );
            })}
          </div>
        ),
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
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date

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
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={data.people?.created_by?.photo}
                alt={``}
                style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid lightgray' }}
              />
              <span style={{ fontSize: 14 }}>{data.people?.created_by?.name}</span>
            </div>
          );
        },
        isSortable: false,
      },
      {
        key: 'people.last_modified_by',
        label: 'Last modified by',
        render: (data) => {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={data.people?.last_modified_by?.photo}
                alt={``}
                style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid lightgray' }}
              />
              <span style={{ fontSize: 14 }}>{data.people?.last_modified_by?.name}</span>
            </div>
          );
        },
        isSortable: false,
      },
      {
        key: 'timestamps.modified_at',
        label: 'Last modified',
        render: (data) => {
          const date = DateTime.fromISO(data.timestamps?.modified_at).toFormat(`LLL. dd, yyyy`);
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date
          return <div style={{ fontSize: 14 }}>{date}</div>;
        },
        isSortable: false,
      },
      { key: 'hidden', label: 'hidden', filter: 'excludes', width: 1 },
    ],
    isPublishable: true,
    publishStage: 5.2,
  },
};

interface Ifeatures {
  [key: string]: boolean | { [key: string]: boolean };
}

const features: Ifeatures = {
  cms: true,
  messages: false,
  plans: true,
  profiles: true,
};

interface Ihome {
  recentItems: Array<{
    label: string;
    icon: React.ReactElement;
    data: () => Promise<AxiosResponse<Record<string, any>[]>>;
    toPrefix: string;
    isProfile?: boolean;
    keys:
      | {
          name: string;
          lastModified: string;
          photo?: string;
          description?: string;
          toSuffix: string;
          history: string;
        }
      | {
          name: string;
          lastModified: string;
          photo?: string;
          description?: string;
          toSuffix: string;
          lastModifiedBy: string;
        };
  }>;
}

const home: Ihome = {
  recentItems: [
    {
      label: 'Articles',
      icon: <News24Regular />,
      data: async () => await db.get(`/articles?historyType=patched&historyType=created`),
      toPrefix: '/cms/item/articles/',
      keys: {
        photo: 'photo_path',
        name: 'name',
        history: 'history',
        lastModified: 'timestamps.modified_at',
        description: 'description',
        toSuffix: '_id',
      },
    },
    {
      label: 'Profiles',
      icon: <PersonBoard24Regular />,
      data: async () => await db.get(`/users`),
      toPrefix: '/profile/',
      keys: {
        name: 'name',
        lastModified: 'timestamps.last_login_at',
        lastModifiedBy: 'people.last_modified_by',
        toSuffix: '_id',
      },
      isProfile: true,
    },
    {
      label: 'Photo requests',
      icon: <ImageSearch24Regular />,
      data: async () => await db.get(`/photo-requests?historyType=patched&historyType=created`),
      toPrefix: '/cms/item/photo-requests/',
      keys: {
        name: 'name',
        history: 'history',
        lastModified: 'timestamps.modified_at',
        toSuffix: '_id',
      },
    },
  ],
};

export { collections, features, home };
export type { tiptapOptions };
