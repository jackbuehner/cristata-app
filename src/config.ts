import { IProfile } from './interfaces/cristata/profiles';
import { IGetTeams } from './interfaces/github/teams';
import { db } from './utils/axios/db';

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
        label: 'Photo Caption',
        type: 'text',
        description:
          'The caption for the photo. It should be relevant to the photo. Not every photo needs a caption.',
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
        label: 'Locked Status',
        type: 'boolean',
        description: 'Control whether this article is able to be modified. NOT IMPLIMENTED.',
        isDisabled: true,
      },
      {
        key: 'permissions.users',
        label: 'User Access Control',
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
        label: 'Team Access Control',
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
  },
};

export { collections };
export type { tiptapOptions };
