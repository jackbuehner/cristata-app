import { DateTime } from 'luxon';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { Chip } from '../../../components/Chip';
import { mongoFilterType } from '../../../graphql/client';
import { GitHubUserID, IProfile } from '../../../interfaces/cristata/profiles';
import { db } from '../../../utils/axios/db';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType } from '../../../utils/theme/theme';
import { collection } from '../../collections';
import { selectPhotoPath } from '../articles/selectPhotoPath';
import { selectProfile } from '../articles/selectProfile';
import { selectTeam } from '../articles/selectTeam';

const satire: collection<ISatire> = {
  home: '/cms/collection/satire/in-progress',
  query: {
    name: {
      singular: 'satire',
      plural: 'satires',
    },
    identifier: '_id',
    force: ['hidden', 'legacy_html'],
  },
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
      async_options: (val) => selectPhotoPath(val),
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
      subfield: 'github_id',
      label: 'Authors',
      type: 'multiselect_async',
      description: 'The authors of this piece of satire. These names do not appear on the website.',
      async_options: (val) => selectProfile(val),
      dataType: 'number',
      modifyValue: (data) => {
        if (Object.prototype.toString.call(data) === '[object Object]')
          return (data as IProfile).github_id.toString();
        return JSON.stringify(data);
      },
    },
    {
      key: 'people.editors.copy',
      subfield: 'github_id',
      label: 'Copy editors',
      type: 'multiselect_async',
      description: 'The copy editors who have made edits to this article.',
      async_options: (val) => selectProfile(val),
      dataType: 'number',
      modifyValue: (data) => {
        if (Object.prototype.toString.call(data) === '[object Object]')
          return (data as IProfile).github_id.toString();
        return JSON.stringify(data);
      },
    },
    {
      key: 'body',
      label: 'Body',
      type: 'tiptap',
      tiptap: {
        type: 'satire',
        isHTMLkey: 'legacy_html',
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
            sweepwidget: true,
            youtube: true,
          },
          link: true,
          comment: true,
          trackChanges: true,
        },
      },
    },
    {
      key: 'permissions.users',
      label: 'User access control',
      type: 'multiselect_async',
      description: 'Control which users can see this article.',
      async_options: (val) => selectProfile(val),
      dataType: 'number',
    },
    {
      key: 'permissions.teams',
      label: 'Team access control',
      type: 'multiselect_async',
      description: 'Control which teams (user groups) can see this article.',
      async_options: (val) => selectTeam(val),
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
    },
    {
      key: 'people.display_authors',
      label: 'Display authors',
      render: (data) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
          {data.people?.display_authors?.map((author: string, index: number) => {
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={genAvatar(author)} alt={``} style={{ width: 20, height: 20, borderRadius: 2 }} />
                <span style={{ fontSize: 14 }}>{author}</span>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      key: 'people.authors',
      label: 'Authors',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people && data.people.authors) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
              {data.people.authors.map(
                (author: { name: string; photo?: string; _id: string }, index: number) => {
                  const { name, photo, _id } = author;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img
                        src={photo ? photo : _id ? genAvatar(_id) : ''}
                        alt={``}
                        style={{ width: 20, height: 20, borderRadius: 2 }}
                      />
                      <span style={{ fontSize: 14 }}>{name}</span>
                    </div>
                  );
                }
              )}
            </div>
          );
        }
        return <></>;
      },
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

        const isLate = DateTime.fromISO(data.timestamps?.target_publish_at) < DateTime.now() && data.stage < 5;
        const isIn24hrs =
          DateTime.fromISO(data.timestamps?.target_publish_at) < DateTime.fromMillis(Date.now() + 86400000) &&
          data.stage < 5; // one day in advance
        const isSoon =
          DateTime.fromISO(data.timestamps?.target_publish_at) < DateTime.fromMillis(Date.now() + 259200000) &&
          data.stage < 5; // three days in advance

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
    },
    {
      key: 'people.created_by',
      label: 'Created by',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people && data.people.created_by) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={
                  data.people.created_by.photo
                    ? data.people.created_by.photo
                    : data.people.created_by._id
                    ? genAvatar(data.people.created_by._id)
                    : ''
                }
                alt={``}
                style={{ width: 20, height: 20, borderRadius: 2 }}
              />
              <span style={{ fontSize: 14 }}>{data.people.created_by.name}</span>
            </div>
          );
        }
        return <></>;
      },
      isSortable: false,
    },
    {
      key: 'people.last_modified_by',
      label: 'Last modified by',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people && data.people.last_modified_by) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={
                  data.people.last_modified_by.photo
                    ? data.people.last_modified_by.photo
                    : data.people.last_modified_by._id
                    ? genAvatar(data.people.last_modified_by._id)
                    : ''
                }
                alt={``}
                style={{ width: 20, height: 20, borderRadius: 2 }}
              />
              <span style={{ fontSize: 14 }}>{data.people.last_modified_by.name}</span>
            </div>
          );
        }
        return <></>;
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
    },
  ],
  row: { href: '/cms/item/satire', hrefSuffixKey: '_id' },
  isPublishable: true,
  publishStage: 5.2,
  defaultSortKey: 'timestamps.target_publish_at',
  pageTitle: (progress, search) => {
    // get the category of the page
    const category = new URLSearchParams(search).get('category');

    // build a title string based on the progress and category
    if (progress === 'in-progress' && category) {
      return `In-progress ${category}${category === 'opinion' ? `s` : ` satire`}`;
    } else if (progress === 'in-progress') {
      return 'In-progress satire';
    } else {
      return 'All satire';
    }
  },
  pageDescription: (progress, search) => {
    // get the category of the page
    const category = new URLSearchParams(search).get('category');

    // build a description string based on the progress and category
    if (progress === 'in-progress' && category) {
      return `The ${category}${
        category === 'opinion' ? `s` : ` satire`
      } we are planning, drafting, and editing.`;
    } else if (progress === 'in-progress') {
      return `The satire we are planning, drafting, and editing.`;
    } else {
      return `Every piece of satire that is in-progress or published on the web.`;
    }
  },
  tableDataFilter: (progress, search) => {
    // get the category of the page
    const category = new URLSearchParams(search).get('category');

    // set a filter object
    const filter: mongoFilterType = { hidden: { $ne: true } };

    // modify filter based on the progress and category
    if (progress === 'in-progress') filter.stage = { $nin: [5.1, 5.2] };
    if (category) filter.categories = category;

    return filter;
  },
  prependSort: (sort) => {
    if (sort['timestamps.target_publish_at']) {
      return { 'timestamps.target_publish_at_is_baseline': 1 };
    }
    return {};
  },
  createNew: ([loading, setIsLoading], toast, history) => {
    setIsLoading(true);
    db.post(`/satire`, {
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
      }),
    })
      .then(({ data }) => {
        setIsLoading(false);
        history.push(`/cms/item/satire/${data._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

// permissions groups
type Teams = string;

// use these as the stages for satires
enum Stage {
  PLANNING = 1.1,
  DRAFT = 2.1,
  PENDING_EDITOR_REVIEW = 3.1,
  PENDING_INTERVIEWEE_APPROVAL = 3.2,
  PENDING_EDIT = 3.4,
  PENDING_UPLOAD = 4.1,
  UPLOADED = 5.1,
  PUBLISHED = 5.2,
}

// interface for each satire
interface ISatire {
  name?: string;
  permissions: {
    teams?: Teams[];
    users: GitHubUserID[];
  };
  locked?: boolean;
  timestamps?: {
    created_at?: Date;
    modified_at?: Date;
    published_at?: Date;
    target_publish_at?: Date;
  };
  people: {
    authors?: IProfile[];
    created_by?: IProfile;
    display_authors?: string[];
    modified_by?: IProfile[];
    last_modified_by: IProfile;
    published_by?: IProfile[];
    editors?: {
      primary?: IProfile;
      copy?: IProfile[];
    };
  };
  stage?: Stage;
  categories?: string[];
  tags?: string[];
  description?: string;
}

export { satire };
export type { ISatire };
