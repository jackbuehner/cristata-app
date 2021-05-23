interface Icollections {
  [key: string]:
    | {
        fields: Array<{
          key: string;
          label?: string; // fall back to name if not provided
          type: string;
          description?: string;
        }>;
      }
    | undefined;
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
      { key: 'stage', label: 'Stage', type: 'select', description: 'The current status of this article.' },
      {
        key: 'categories',
        label: 'Sections',
        type: 'multiselect',
        description: 'The sections in which this article belongs.',
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'multiselect',
        description: 'Keywords and tags that apply to this article. Allows custom entries.',
      },
      {
        key: 'locked',
        label: 'Locked Status',
        type: 'boolean',
        description: 'Control whether this article is able to be modified.',
      },
      {
        key: 'permissions.users',
        label: 'User Access Control',
        type: 'multiselect',
        description: 'Control which users can see this article.',
      },
      {
        key: 'permissions.teams',
        label: 'Team Access Control',
        type: 'multiselect',
        description: 'Control which teams (user groups) can see this article.',
      },
      { key: 'timestamps.created_at', label: 'Created at', type: 'datetime' },
      { key: 'timestamps.modified_at', label: 'Modified at', type: 'datetime' },
      { key: 'timestamps.published_at', label: 'Published at', type: 'datetime' },
      { key: 'timestamps.target_publish_at', label: 'Target publish date and time', type: 'datetime' },
    ],
  },
};

export { collections };
