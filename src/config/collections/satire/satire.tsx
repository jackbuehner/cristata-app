import { DateTime } from 'luxon';
import { Chip } from '../../../components/Chip';
import { colorType } from '../../../utils/theme/theme';
import { collection } from '../../collections';
import { selectPhotoPath } from '../articles/selectPhotoPath';
import { selectProfile } from '../articles/selectProfile';
import { selectTeam } from '../articles/selectTeam';

const satire: collection = {
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
      label: 'Authors',
      type: 'multiselect_async',
      description: 'The authors of this piece of satire. These names do not appear on the website.',
      async_options: (val) => selectProfile(val),
      dataType: 'number',
    },
    {
      key: 'people.editors.copy',
      label: 'Copy editors',
      type: 'multiselect_async',
      description: 'The copy editors who have made edits to this article.',
      async_options: (val) => selectProfile(val),
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
};

export { satire };
