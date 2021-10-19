import { DateTime } from 'luxon';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { Chip } from '../../../components/Chip';
import { GitHubUserID, IProfile } from '../../../interfaces/cristata/profiles';
import { db } from '../../../utils/axios/db';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType } from '../../../utils/theme/theme';
import { collection } from '../../collections';
import { selectPhotoPath } from './selectPhotoPath';
import { selectProfile } from './selectProfile';
import { selectTeam } from './selectTeam';

const articles: collection<IArticle> = {
  home: '/cms/collection/articles/in-progress',
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
      label: 'Categories',
      type: 'multiselect',
      description: 'The sections or categories in which this article belongs.',
      options: [
        { value: 'news', label: 'News' },
        { value: 'opinion', label: 'Opinions' },
        { value: 'sports', label: 'Sports' },
        { value: 'diversity', label: 'Diversity Matters' },
        { value: 'arts', label: 'Arts' },
        { value: 'campus-culture', label: 'Campus & Culture' },
        { value: 'giveaway', label: 'Giveaway' },
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
      async_options: (val) => selectPhotoPath(val),
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
      async_options: (val) => selectProfile(val),
      dataType: 'number',
      modifyValue: (data) => {
        if (Object.prototype.toString.call(data) === '[object Object]')
          return (data as IProfile).github_id.toString();
        return JSON.stringify(data);
      },
    },
    {
      key: 'people.editors.primary',
      label: 'Section editors',
      type: 'multiselect_async',
      description: 'The managing editors responsible for this article.',
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
        type: 'article',
        isHTMLkey: 'legacy_html',
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
      key: 'show_comments',
      label: 'Show comments',
      type: 'boolean',
      description: 'Control whether this article has the comments panel enabled on the website.',
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

        if (data.stage) {
          return (
            <Chip label={Stage[data.stage]} color={Color[data.stage] || 'neutral'} data-number={data.stage} />
          );
        }
        return <></>;
      },
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
      key: 'people.authors',
      label: 'Authors',
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
      key: 'categories',
      label: 'Categories',
      render: (data) => {
        const categories: { [key: string]: string } = {
          news: 'News',
          opinion: 'Opinion',
          sports: 'Sports',
          diversity: 'Diversity Matters',
          arts: 'Arts',
          'campus-culture': 'Campus & Culture',
          giveaway: 'Giveaway',
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
        if (data.timestamps && data.timestamps.target_publish_at) {
          const date = DateTime.fromISO(data.timestamps.target_publish_at).toFormat(`LLL. dd, yyyy`);
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date

          const isLate = DateTime.fromISO(data.timestamps.target_publish_at) < DateTime.now() && data.stage < 5;
          const isIn24hrs =
            DateTime.fromISO(data.timestamps.target_publish_at) < DateTime.fromMillis(Date.now() + 86400000) &&
            data.stage < 5; // one day in advance
          const isSoon =
            DateTime.fromISO(data.timestamps.target_publish_at) < DateTime.fromMillis(Date.now() + 259200000) &&
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
        }
        return <></>;
      },
      width: 174,
      sortType: (rowA, rowB, columnId) => {
        /**
         * Sort the column by date. This is a specialized function that retrieves the first child (the date)
         * from the react div component.
         *
         * @returns 1 if rowA time is larger than rowB, -1 if rowB is larger than rowA, 0 is equal
         */
        const timeA = new Date(rowA.values[columnId].props.children?.[0]).getTime();
        const timeB = new Date(rowB.values[columnId].props.children?.[0]).getTime();
        if (timeA > timeB) return 1;
        else if (timeB > timeA) return -1;
        return 0;
      },
    },
    {
      key: 'people.editors.copy',
      label: 'Copy edited by',
      render: (data) => {
        if (data.people && data.people.editors && data.people.editors.copy) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
              {data.people.editors.copy.map(
                (editor: { name: string; photo?: string; _id: string }, index: number) => {
                  const { name, photo, _id } = editor;
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
      key: 'people.created_by',
      label: 'Created by',
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
        if (data.timestamps && data.timestamps.modified_at) {
          const date = DateTime.fromISO(data.timestamps?.modified_at).toFormat(`LLL. dd, yyyy`);
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date
          return <div style={{ fontSize: 14 }}>{date}</div>;
        }
        return <></>;
      },
      sortType: (rowA, rowB, columnId) => {
        /**
         * Sort the column by date. This is a specialized function that retrieves the first child (the date)
         * from the react div component.
         *
         * @returns 1 if rowA time is larger than rowB, -1 if rowB is larger than rowA, 0 is equal
         */
        const timeA = new Date(rowA.values[columnId].props.children).getTime();
        const timeB = new Date(rowB.values[columnId].props.children).getTime();
        console.log(timeA);
        if (timeA > timeB) return 1;
        else if (timeB > timeA) return -1;
        return 0;
      },
    },
    { key: 'hidden', label: 'hidden', filter: 'excludes', width: 1 },
  ],
  row: {
    href: '/cms/item/articles',
    hrefSuffixKey: '_id',
    hrefSearch: '?fs=force&props=1',
    windowName: window.matchMedia('(display-mode: standalone)').matches ? 'editor' : undefined,
  },
  isPublishable: true,
  canWatch: true,
  mandatoryWatchers: ['people.authors', 'people.editors.primary'],
  publishStage: 5.2,
  defaultSortKey: 'timestamps.target_publish_at',
  pageTitle: (progress, search) => {
    // get the category of the page
    const category = new URLSearchParams(search).get('category');

    // build a title string based on the progress and category
    if (progress === 'in-progress' && category) {
      return `In-progress ${category}${category === 'opinion' ? `s` : ` articles`}`;
    } else if (progress === 'in-progress') {
      return 'In-progress articles';
    } else {
      return 'All articles';
    }
  },
  pageDescription: (progress, search) => {
    // get the category of the page
    const category = new URLSearchParams(search).get('category');

    // build a description string based on the progress and category
    if (progress === 'in-progress' && category) {
      return `The ${category}${
        category === 'opinion' ? `s` : ` articles`
      } we are planning, drafting, and editing.`;
    } else if (progress === 'in-progress') {
      return `The articles we are planning, drafting, and editing.`;
    } else {
      return `Every article that is in-progress or published on the web.`;
    }
  },
  tableFilters: (progress, search) => {
    // get the category of the page
    const category = new URLSearchParams(search).get('category');

    // build the filters array based on the progress and category
    let filters: { id: string; value: string }[] = [{ id: 'hidden', value: 'true' }];
    if (progress === 'in-progress') {
      filters.push({ id: 'stage', value: 'Published' });
      filters.push({ id: 'stage', value: 'Uploaded/Scheduled' });
    }
    if (category) {
      filters.push({ id: 'categories', value: category });
    }
    return filters;
  },
  createNew: ([loading, setIsLoading], toast, history) => {
    setIsLoading(true);
    db.post(`/articles`, {
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
      }),
    })
      .then(({ data }) => {
        setIsLoading(false);
        history.push(`/cms/item/articles/${data._id}`);
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

// interface for each article
interface IArticle {
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
// use these as the stages for articles
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

export { articles };
export type { IArticle };
