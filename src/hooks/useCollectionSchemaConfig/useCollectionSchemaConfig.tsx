import {
  GenSchemaInput,
  isSchemaDef,
  SchemaDef,
  isSchemaRef,
  SchemaDefType,
} from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';

/**
 *
 */
function useCollectionSchemaConfig(key: string): [
  {
    schemaDef: [string, SchemaDef][];
    nameField?: string;
    canPublish: boolean;
    withPermissions: boolean;
    options?: { mandatoryWatchers?: string[] };
  }
] {
  if (key === 'articles') {
    const parseSchemaDefType = (schemaDefObject: SchemaDefType, parentKey?: string) => {
      let schemaDefs: [string, SchemaDef][] = [];

      Object.entries(schemaDefObject).forEach(([key, def]) => {
        const constructedKey = `${parentKey ? parentKey + '.' : ''}${key}`;

        // is a schema definition for a specific field
        if (isSchemaDef(def)) {
          schemaDefs.push([constructedKey, def]);
        }
        // is a reference to a field in another document
        else if (isSchemaRef(def)) {
        }
        // is an object containing schema defs, schema refs, and nested schemas
        else if (Array.isArray(def)) {
          schemaDefs.push(...parseSchemaDefType(def[0], constructedKey));
        }
        // is an object containing schema defs (nested schemas)
        else {
          schemaDefs.push(...parseSchemaDefType(def, constructedKey));
        }
      });

      return schemaDefs;
    };

    return [
      {
        schemaDef: parseSchemaDefType(articles),
        canPublish: true,
        withPermissions: true,
        options: {
          mandatoryWatchers: ['people.authors', 'people.editors.primary'],
        },
      },
    ];
  }

  return [{ schemaDef: [], canPublish: false, withPermissions: false }];
}

export { useCollectionSchemaConfig };

const articles: GenSchemaInput['schemaDef'] = {
  name: {
    type: 'String',
    required: true,
    modifiable: true,
    public: true,
    default: 'New Article',
    field: { label: 'Headline', order: 1 },
  },
  slug: {
    type: 'String',
    modifiable: true,
    public: true,
    setter: {
      condition: { $and: [{ stage: { $eq: 5.2 } }, { slug: { $exists: false } }] },
      value: { slugify: 'name' },
    },
    field: { hidden: true },
  },
  stage: {
    type: 'Float',
    modifiable: true,
    default: 1.1,
    field: {
      label: 'Stage',
      options: [
        { value: 1.1, label: 'Planning' },
        { value: 2.1, label: 'Draft' },
        { value: 3.1, label: 'Pending Editor Review' },
        { value: 3.2, label: 'Pending Writer Revision' },
        { value: 3.3, label: 'Pending Copy Edit' },
        { value: 3.5, label: 'Pending Writer/Editor Check' },
        { value: 4.1, label: 'Pending Upload Approval' },
        { value: 5.1, label: 'Uploaded/Scheduled', disabled: true },
        { value: 5.2, label: 'Published', disabled: true },
      ],
    },
  },
  categories: {
    type: ['String'],
    modifiable: true,
    public: true,
    default: [],
    field: {
      label: 'Categories',
      order: 4,
      description: 'The sections or categories in which this article belongs.',
      options: [
        { value: 'news', label: 'News' },
        { value: 'opinion', label: 'Opinions' },
        { value: 'sports', label: 'Sports' },
        { value: 'diversity', label: 'Diversity Matters' },
        { value: 'arts', label: 'Arts' },
        { value: 'campus-culture', label: 'Campus & Culture' },
        { value: 'giveaway', label: 'Giveaway' },
        { value: 'newsletter', label: 'Newsletter' },
      ],
    },
  },
  tags: {
    type: ['String'],
    modifiable: true,
    public: true,
    default: [],
    field: {
      label: 'Tags',
      order: 5,
      description: 'Keywords and tags relevant to this article.',
    },
  },
  description: {
    type: 'String',
    required: true,
    modifiable: true,
    public: true,
    default: '',
    field: {
      label: 'Deck',
      order: 2,
      description: 'A short summary of the article that will draw in the reader.',
    },
  },
  photo_path: {
    type: 'String',
    required: true,
    modifiable: true,
    public: true,
    default: '',
    field: {
      label: 'Cover photo',
      order: 10,
      description: 'The photo that appears at the top of every article and in most article cards.',
      reference: {
        collection: 'Photo',
        fields: { _id: 'photo_url', name: 'name' },
        require: ['people.photo_created_by'],
      },
    },
  },
  video_path: {
    type: 'String',
    required: true,
    modifiable: true,
    public: true,
    default: '',
    field: {
      label: 'Related video',
      order: 14,
    },
  },
  video_replaces_photo: {
    type: 'Boolean',
    required: true,
    modifiable: true,
    public: true,
    default: false,
    field: {
      label: 'Replace cover photo with related video',
      order: 15,
    },
  },
  photo_credit: {
    model: 'Photo',
    by: 'photo_url',
    matches: 'photo_path',
    field: 'people.photo_created_by',
    fieldType: 'String',
    public: true,
  },
  photo_caption: {
    type: 'String',
    required: true,
    modifiable: true,
    public: true,
    default: '',
    field: {
      label: 'Cover photo caption',
      order: 11,
      description:
        'The caption for the photo. It should be relevant to the photo. Not every photo needs a caption.',
    },
  },
  body: {
    type: 'String',
    modifiable: true,
    public: true,
    field: {
      label: 'Body',
      order: 6,
      tiptap: {
        type: 'article',
        isHTMLkey: 'legacy_html',
        layouts: {
          key: 'layout',
          options: [
            { value: 'standard', label: 'Standard' },
            { value: 'full', label: 'Full' },
          ],
        },
        keys_article: {
          headline: 'name',
          description: 'description',
          categories: 'categories',
          caption: 'photo_caption',
          photo_url: 'photo_path',
          authors: 'people.authors',
          target_publish_at: 'timestamps.target_publish_at',
        },
        features: {
          fontFamilies: [
            { name: 'Adamant BG', label: 'Adamant BG (Headline)', disabled: true },
            { name: 'Arial', disabled: true },
            { name: 'Calibri', disabled: true },
            { name: 'Consolas', disabled: true },
            { name: 'Georgia', label: 'Georgia (Body)' },
            { name: 'Times New Roman', disabled: true },
          ],
          fontSizes: [],
          bold: true,
          italic: true,
          underline: true,
          strike: true,
          code: true,
          bulletList: true,
          orderedList: true,
          textStylePicker: true,
          horizontalRule: true,
          widgets: {
            photoWidget: true,
            sweepwidget: true,
            youtube: true,
          },
          link: true,
          comment: true,
          trackChanges: true,
        },
      },
    },
  },
  legacy_html: {
    type: 'Boolean',
    required: true,
    modifiable: true,
    public: true,
    default: false,
    field: { hidden: true },
  },
  show_comments: {
    type: 'Boolean',
    required: true,
    modifiable: true,
    public: true,
    default: false,
    field: {
      label: 'Show the comments panel for this article on the website',
      order: 20,
    },
  },
  layout: {
    type: 'String',
    required: true,
    modifiable: true,
    public: true,
    default: 'standard',
    field: { hidden: true },
  },
  template: {
    type: 'String',
    required: true,
    modifiable: true,
    public: true,
    default: 'jackbuehner2020',
    field: { hidden: true },
  },
  claps: { type: 'Number', modifiable: true, public: true, default: 0, field: { hidden: true } },
  people: {
    authors: {
      type: ['[User]', ['ObjectId']],
      required: true,
      modifiable: true,
      public: true,
      default: [],
      field: { label: 'Byline', reference: { fields: {} } },
    },
    editors: {
      primary: {
        type: ['[User]', ['ObjectId']],
        required: true,
        modifiable: true,
        public: true,
        default: [],
        field: {
          label: 'Managing editors',
          description: 'The managing editors responsible for this article.',
          reference: { fields: {} },
        },
      },
      copy: {
        type: ['[User]', ['ObjectId']],
        required: true,
        modifiable: true,
        public: true,
        default: [],
        field: {
          label: 'Copy editors',
          description: 'The copy editors who have made edits to this article.',
          reference: { fields: {} },
        },
      },
    },
  },
  timestamps: {
    target_publish_at: {
      type: 'Date',
      modifiable: true,
      default: '0001-01-01T01:00:00.000+00:00',
      field: {
        label: 'Target date',
        description:
          'When the article should be ready for publishing. Have it ready for copy editing at least one full day before this date.',
        order: 3,
      },
    },
  },
  permissions: {
    teams: {
      type: ['ObjectId'],
      modifiable: true,
      default: ['000000000000000000000003', '000000000000000000000004'],
      required: true,
    },
  },
  legacy_comments: [
    {
      author_name: { type: 'String', modifiable: false, public: true, field: { hidden: true } },
      commented_at: { type: 'Date', modifiable: false, public: true, field: { hidden: true } },
      content: { type: 'String', modifiable: false, public: true, field: { hidden: true } },
    },
  ],
};
