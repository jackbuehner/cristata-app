import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { WebSocketStatus } from '@hocuspocus/provider';
import type { MongooseSchemaType, StringOption } from '@jackbuehner/cristata-generator-schema';
import { isTypeTuple } from '@jackbuehner/cristata-generator-schema';
import Color from 'color';
import ColorHash from 'color-hash';
import { merge } from 'merge-anything';
import { get as getProperty } from 'object-path';
import pluralize from 'pluralize';
import type { SetStateAction } from 'react';
import { Fragment, useEffect, useState } from 'react';
import useDimensions from 'react-cool-dimensions';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactRouterPrompt from 'react-router-prompt';
import ReactTooltip from 'react-tooltip';
import { Button } from '../../../components/Button';
import {
  CollaborativeCheckbox,
  CollaborativeCode,
  CollaborativeDateTime,
  CollaborativeDocArray,
  CollaborativeNumberField,
  CollaborativeReferenceMany,
  CollaborativeReferenceOne,
  CollaborativeSelectMany,
  CollaborativeSelectOne,
  CollaborativeTextField
} from '../../../components/CollaborativeFields';
import { Field } from '../../../components/ContentField/Field';
import { Spinner } from '../../../components/Loading';
import { PlainModal } from '../../../components/Modal';
import { Offline } from '../../../components/Offline';
import { Tab, TabBar } from '../../../components/Tabs';
import { Tiptap } from '../../../components/Tiptap';
import type { useAwareness } from '../../../components/Tiptap/hooks';
import { useY } from '../../../components/Tiptap/hooks';
import type { EntryY } from '../../../components/Tiptap/hooks/useY';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import type {
  DeconstructedSchemaDefType
} from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import {
  parseSchemaDefType
} from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { capitalize } from '../../../utils/capitalize';
import { server } from '../../../utils/constants';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { genAvatar } from '../../../utils/genAvatar';
import type { colorType, themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';
import { FullScreenSplash } from './FullScreenSplash';
import type { GetYFieldsOptions } from './getYFields';
import { getYFields } from './getYFields';
import { PreviewFrame } from './PreviewFrame';
import { Sidebar } from './Sidebar';
import type { Action } from './useActions';
import { useActions } from './useActions';
import { useFindDoc } from './useFindDoc';
import { usePublishPermissions } from './usePublishPermissions';
import { useWatching } from './useWatching';

// @ts-expect-error 'bkdr' is a vlid hash config value
const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5, hash: 'bkdr' });

interface CollectionItemPageProps {}

function CollectionItemPage(props: CollectionItemPageProps) {
  const authUserState = useAppSelector((state) => state.authUser);
  let { collection, item_id, version_date } = useParams() as {
    collection: string;
    item_id: string;
    version_date?: string;
  };
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // get the current tenant name
  const tenant = location.pathname.split('/')[1];

  // create a user object for the current user (for yjs)
  const user = {
    name: authUserState.name,
    color: colorHash.hex(authUserState._id),
    sessionId: sessionId || '',
    _id: authUserState._id,
    photo: `${server.location}/v3/${tenant}/user-photo/${authUserState._id}` || genAvatar(authUserState._id),
  };

  // connect to other clients with yjs for collaborative editing
  const [{ schemaDef }] = useCollectionSchemaConfig(collectionName);
  const y = useY({
    collection: pluralize.singular(collection),
    id: item_id,
    versionDate: version_date,
    user,
    schemaDef,
  }); // create or load y

  return <CollectionItemPageContent y={y} user={user} />;
}

interface CollectionItemPageContentProps {
  y: EntryY;
  user: ReturnType<typeof useAwareness>[0];
  isEmbedded?: boolean; // controls whether header, padding, tiptap, etc are hidden
}

function CollectionItemPageContent(props: CollectionItemPageContentProps) {
  const isLoading = useAppSelector((state) => state.cmsItem.isLoading);
  const authUserState = useAppSelector((state) => state.authUser);
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const { search } = useLocation();
  const navigate = useNavigate();
  const tenant = location.pathname.split('/')[1] || '';
  let { collection, item_id, version_date } = useParams() as {
    collection: string;
    item_id: string;
    version_date?: string;
  };
  const isOldVersion = !!version_date;
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));
  const [
    {
      schemaDef,
      canPublish: isPublishableCollection,
      options: collectionOptions,
      withPermissions,
      by,
      options,
    },
  ] = useCollectionSchemaConfig(collectionName);

  // put the document in redux state and ydoc
  const { data, actionAccess, loading, error } = useFindDoc(
    uncapitalize(collectionName),
    item_id,
    schemaDef,
    withPermissions,
    props.isEmbedded || by === null || false,
    by?.one,
    props.y
  );

  const docNotFound = !data && !loading && !props.isEmbedded;

  // function to get the values of the fields for previews (used in sidebar)
  const getFieldValues = async (opts: GetYFieldsOptions) => {
    return merge(data, { yState: undefined }, await getYFields(props.y, schemaDef, opts));
  };

  const hasLoadedAtLeastOnce = JSON.stringify(props.y.data) !== JSON.stringify({}) && props.y.synced;

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // construct the name field with the field provied
  let docName = options?.nameField || collectionName;
  if (options?.nameField?.includes('%')) {
    const schemaKeys = schemaDef
      .filter(([, def]) => def.type === 'String' || def.type === 'Number' || def.type === 'Float')
      .map(([key]) => key);

    for (const key of schemaKeys) {
      if (docName.includes(`%${key}%`)) {
        docName = docName.replaceAll(`%${key}%`, getProperty(props.y.data, key));
      }
    }
  } else {
    docName = getProperty(props.y.data, options?.nameField || 'name') || docName;
  }
  if (docName.includes('undefined')) docName = collectionName;

  // set the document title
  const title = (() => {
    let title = '';

    // show document name in the title
    title += docName;

    // show written note about unsaved status
    if (isLoading) title += ' - Syncing';

    // always end with Cristata
    title += ' - Cristata';

    return title;
  })();
  if (document.title !== title) document.title = title;

  // calculate publish permissions
  const {
    canPublish,
    publishLocked,
    lastStage: publishStage,
  } = usePublishPermissions({
    isPublishableCollection,
    itemStateFields: props.y.data,
    schemaDef,
    publishActionAccess: actionAccess?.publish,
  });

  // fs search param
  const fs = new URLSearchParams(search).get('fs');
  const isMaximized = fs === '1' || fs === 'force';

  // calculate user watching status
  const { isWatching, isMandatoryWatcher, mandatoryWatchersList } = useWatching({
    authUserState,
    itemStateFields: props.y.data,
    mandatoryWatchersKeys: collectionOptions?.mandatoryWatchers || [],
  });

  const locked =
    publishLocked ||
    (props.y.data.archived as boolean | undefined | null) ||
    (props.y.data.hidden as boolean | undefined | null) ||
    (props.y.data.locked as boolean | undefined | null) ||
    (!!props.y.data._hasPublishedDoc && (props.y.data.stage as number) === 5.2) ||
    false;

  // use a keyboard shortcut to trigger whether hidden fields are shown
  const [showHidden, setShowHidden] = useState(false);
  useEffect(() => {
    const listener = (ev: KeyboardEvent) => {
      // ALT + SHIFT + H
      if (ev.altKey && ev.shiftKey && ev.key === 'H') {
        setShowHidden((showHidden) => !showHidden);
      }
    };
    document.addEventListener('keyup', listener);
    return () => {
      document.removeEventListener('keyup', listener);
    };
  });

  const [tabIndex, setTabIndex] = useState<number>(0);

  const processSchemaDef = (
    schemaDef: DeconstructedSchemaDefType,
    isPublishModal?: boolean,
    opts?: { collapsed?: boolean }
  ): DeconstructedSchemaDefType => {
    return (
      schemaDef
        .map(([key, def]) => {
          const labelDef = def.docs?.find(([ckey]) => ckey.replace(key + '.', '') === '#label')?.[1];
          return [key, def, labelDef] as [string, typeof def, typeof labelDef];
        })
        // sort fields to match their order
        .sort((a, b) => {
          const orderA = parseInt(`${a[1].field?.order || 1000}`);
          const orderB = parseInt(`${b[1].field?.order || 1000}`);
          return orderA > orderB ? 1 : -1;
        })
        // hide hidden fields
        .filter(([, def]) => {
          if (showHidden) return true;
          if (isPublishModal) return def.field?.hidden === 'publish-only';
          return def.field?.hidden !== true && def.field?.hidden !== 'publish-only';
        })
        // remove fields that are used in the sidebar
        .filter(([key]) => {
          if (key === 'stage') return false;
          if (key === 'permissions.users') return false;
          if (key === 'permissions.teams') return false;
          return true;
        })
        // remove timestamps related to publishing
        .filter(([key]) => {
          return key !== 'timestamps.published_at' && key !== 'timestamps.updated_at';
        })
        .filter(([key, def, labelDef]) => {
          if (opts?.collapsed === true)
            return def.field?.collapsed === true || labelDef?.field?.collapsed === true;
          if (opts?.collapsed === false)
            return def.field?.collapsed !== true && labelDef?.field?.collapsed !== true;
          return true;
        })
        .map(([key, def]) => {
          return [key, def] as [string, typeof def];
        })
    );
  };

  let actions: Action[] = [];

  const previewUrl = options?.dynamicPreviewHref;

  const [isShowingCollapsed, setIsShowingCollapsed] = useState(false);

  const renderFields: RenderFields = (
    input,
    index,
    arr,
    inArrayKey,
    yjsDocArrayConfig,
    isEmbedded = props.isEmbedded
  ) => {
    const reactKey = `${index}.${collectionName}.${item_id}`;

    const [key, def] = input;

    const isSubDocArray = def.type === 'DocArray';

    const readOnly =
      def.field?.readonly === true || isSubDocArray
        ? def.docs?.[0]?.[1]?.modifiable !== true
        : def.modifiable !== true;
    let fieldName = def.field?.label || key;

    // if a field is readonly, add readonly to the field name
    if (readOnly) fieldName += ' (read only)';

    // prevent the fields from being edited when any of the following are true
    const disabled =
      locked ||
      loading ||
      isLoading ||
      !!error ||
      readOnly ||
      props.y.wsStatus !== WebSocketStatus.Connected ||
      isOldVersion;

    // use this key for yjs shared type key for doc array contents
    // so there shared type for each field in the array is unique
    // for the array and array doc
    const docArrayYjsKey = yjsDocArrayConfig
      ? `__docArray.‾‾${yjsDocArrayConfig.parentKey}‾‾.${yjsDocArrayConfig.__uuid}.${yjsDocArrayConfig.childKey}`
      : undefined;

    // pass this to every collaborative field so it can communicate with yjs
    const fieldY = { ...props.y, field: docArrayYjsKey || key, user: props.user };

    if (isSubDocArray) {
      // do not show hidden subdoc arrays
      const isHidden = def.docs.find(([subkey, def]) => subkey === `${key}.#label`)?.[1].field?.hidden || false;
      if (isHidden) return <Fragment key={reactKey}></Fragment>;

      const label = def.docs.find(([subkey, def]) => subkey === `${key}.#label`)?.[1].field?.label || key;
      const description = def.docs.find(([subkey, def]) => subkey === `${key}.#label`)?.[1].field?.description;
      return (
        <CollaborativeDocArray
          y={fieldY}
          label={label}
          description={description}
          disabled={disabled}
          key={key}
          stateFieldKey={key}
          schemaDefs={processSchemaDef(def.docs)}
          processSchemaDef={processSchemaDef}
          renderFields={renderFields}
        />
      );
    }

    const type: MongooseSchemaType = isTypeTuple(def.type) ? def.type[1] : def.type;

    // do not render fields with # in their name
    // because they are private fields that are used
    // for various purposed not meant to be exposed
    // to users in the CMS UI
    if (key.includes('#')) return <></>;

    // hide all fields except the body tiptap field when
    // the body tiptap field is maximized
    // (to prevent duplicate fields; tiptap embeds the fields in a pane)
    if (isMaximized && !(key === 'body' && def.field?.tiptap) && !isEmbedded) {
      return <></>;
    }

    // body field as tiptap editor
    if (key === 'body' && def.field?.tiptap) {
      if (isEmbedded) return <></>;

      // get the HTML
      const isHTML = def.field.tiptap.isHTMLkey && getProperty(props.y.data, def.field.tiptap.isHTMLkey);

      return (
        <Field
          key={reactKey}
          color={isEmbedded ? 'blue' : 'primary'}
          label={fieldName}
          description={def.field?.description}
          isEmbedded={isEmbedded}
        >
          <EmbeddedFieldContainer theme={theme}>
            <Tiptap
              y={fieldY}
              user={props.user}
              docName={`${collection}.${item_id}`}
              title={title}
              options={def.field.tiptap}
              isDisabled={disabled || publishLocked ? true : isHTML ? true : def.field.readonly}
              showLoading={isLoading}
              isMaximized={isMaximized}
              forceMax={fs === 'force'}
              actions={isOldVersion ? [] : actions}
              layout={`${props.y.data.layout}`}
              message={
                isOldVersion
                  ? 'You are currently viewing an old version of this document. You cannot make edits.'
                  : props.y.data._hasPublishedDoc && props.y.data.stage === publishStage
                  ? 'This document is read-only mode because it is published. Begin an update session to make edits.'
                  : props.y.data._hasPublishedDoc
                  ? 'You are in an update session for a currently published document. Your changes will not appear to the public until you publish them.'
                  : publishLocked
                  ? 'This document is opened in read-only mode because it has been published and you do not have publish permissions.'
                  : props.y.data.hidden
                  ? 'This document is opened in read-only mode because it is deleted. Restore it from the deleted items to edit.'
                  : props.y.data.archived
                  ? 'This document is opened in read-only mode because it is archived. Remove it from the archive to edit.'
                  : props.y.data.stage === publishStage
                  ? 'This document is currently published. Changes will be publically reflected immediately.'
                  : undefined
              }
              compact={fs !== '1' && fs !== 'force'}
            />
          </EmbeddedFieldContainer>
        </Field>
      );
    }

    // reference
    if (def.field?.reference?.collection || isTypeTuple(def.type)) {
      //TODO: add property for adding filter and sort to the query

      const isArrayType =
        (isTypeTuple(def.type) && Array.isArray(def.type[1])) ||
        (!isTypeTuple(def.type) && Array.isArray(def.type));

      const collection = isTypeTuple(def.type)
        ? def.type[0].replace('[', '').replace(']', '')
        : def.field!.reference!.collection!;

      if (isArrayType) {
        return (
          <CollaborativeReferenceMany
            key={reactKey}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            color={isEmbedded ? 'blue' : 'primary'}
            disabled={disabled}
            isEmbedded={isEmbedded}
            collection={pluralize.singular(collection)}
            reference={def.field?.reference}
          />
        );
      }

      return (
        <CollaborativeReferenceOne
          key={reactKey}
          label={fieldName}
          description={def.field?.description}
          y={fieldY}
          // only show the value if it is truthy
          color={isEmbedded ? 'blue' : 'primary'}
          // disable when the api requires the field to always have a value but a default
          // value for when no specific photo is selected is not defined
          disabled={disabled || (def.required && def.default === undefined)}
          isEmbedded={isEmbedded}
          collection={pluralize.singular(collection)}
          reference={def.field?.reference}
        />
      );
    }

    // markdown fields
    if (type === 'String' && def.field?.markdown) {
      return (
        <CollaborativeCode
          key={reactKey}
          label={fieldName + ' (Markdown)'}
          description={def.field?.description}
          type={'md'}
          y={fieldY}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
          showPreviewTab={!previewUrl}
        />
      );
    }

    // plain text fields
    if (type === 'String') {
      if (def.field?.options) {
        const options = def.field.options as StringOption[];
        return (
          <CollaborativeSelectOne
            key={reactKey}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            options={options}
            color={isEmbedded ? 'blue' : 'primary'}
            disabled={disabled}
            isEmbedded={isEmbedded}
          />
        );
      }

      return (
        <CollaborativeTextField
          key={reactKey}
          label={fieldName}
          description={def.field?.description}
          y={fieldY}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
        />
      );
    }

    // checkbox
    if (type === 'Boolean') {
      return (
        <CollaborativeCheckbox
          key={reactKey}
          label={fieldName}
          description={def.field?.description}
          y={fieldY}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
        />
      );
    }

    // integer fields
    if (type === 'Number') {
      if (def.field?.options) {
        const options = def.field.options.map((opt) => ({ ...opt, value: opt.toString() }));
        return (
          <CollaborativeSelectOne
            key={reactKey}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            options={options}
            number={'integer'}
            color={isEmbedded ? 'blue' : 'primary'}
            disabled={disabled}
            isEmbedded={isEmbedded}
          />
        );
      }
      return (
        <CollaborativeNumberField
          key={reactKey}
          label={fieldName}
          description={def.field?.description}
          y={fieldY}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
        />
      );
    }

    // float fields
    if (type === 'Float') {
      if (def.field?.options) {
        const options = def.field.options.map((opt) => ({ ...opt, value: opt.value.toString() }));
        return (
          <CollaborativeSelectOne
            key={reactKey}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            options={options}
            number={'decimal'}
            color={isEmbedded ? 'blue' : 'primary'}
            disabled={disabled}
            isEmbedded={isEmbedded}
          />
        );
      }
      return (
        <CollaborativeNumberField
          key={reactKey}
          label={fieldName}
          allowDecimals
          description={def.field?.description}
          y={fieldY}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
        />
      );
    }

    // array of strings
    if (type?.[0] === 'String') {
      if (def.field?.options) {
        const options = def.field.options as StringOption[];
        return (
          <CollaborativeSelectMany
            key={reactKey}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            options={options}
            color={isEmbedded ? 'blue' : 'primary'}
            disabled={disabled}
            isEmbedded={isEmbedded}
          />
        );
      }
      return (
        <CollaborativeSelectMany
          key={reactKey}
          label={fieldName}
          description={def.field?.description}
          y={fieldY}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
        />
      );
    }

    // array of integers
    if (type?.[0] === 'Number') {
      if (def.field?.options) {
        const options = def.field.options as StringOption[];
        return (
          <CollaborativeSelectMany
            key={reactKey}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            options={options}
            number={'integer'}
            color={isEmbedded ? 'blue' : 'primary'}
            disabled={disabled}
            isEmbedded={isEmbedded}
          />
        );
      }
      return (
        <CollaborativeSelectMany
          key={reactKey}
          label={fieldName}
          description={def.field?.description}
          y={fieldY}
          number={'integer'}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
        />
      );
    }

    // array of floats
    if (type?.[0] === 'Float') {
      if (def.field?.options) {
        const options = def.field.options as StringOption[];
        return (
          <CollaborativeSelectMany
            key={reactKey}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            options={options}
            number={'decimal'}
            color={isEmbedded ? 'blue' : 'primary'}
            disabled={disabled}
            isEmbedded={isEmbedded}
          />
        );
      }
      return (
        <CollaborativeSelectMany
          key={reactKey}
          label={fieldName}
          description={def.field?.description}
          y={fieldY}
          number={'decimal'}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
        />
      );
    }

    // plain text fields
    if (type === 'Date') {
      return (
        <CollaborativeDateTime
          key={reactKey}
          label={fieldName}
          description={def.field?.description}
          y={fieldY}
          color={isEmbedded ? 'blue' : 'primary'}
          disabled={disabled}
          isEmbedded={isEmbedded}
          placeholder={'Pick a time'}
        />
      );
    }

    // fallback
    return (
      <Field
        key={reactKey}
        color={isEmbedded ? 'blue' : 'primary'}
        label={fieldName}
        description={def.field?.description}
        isEmbedded={isEmbedded}
      >
        <code>{JSON.stringify(def, null, 2)}</code>
      </Field>
    );
  };

  // determine the actions for this document
  const {
    actions: _actions,
    quickActions,
    showActionDropdown,
    Windows,
  } = useActions({
    y: props.y,
    actionAccess,
    canPublish,
    collectionName,
    itemId: item_id,
    dispatch,
    watch: {
      isMandatoryWatcher: isMandatoryWatcher || false,
      isWatching: isWatching || false,
      mandatoryWatchersList,
    },
    navigate,
    publishStage,
    withPermissions,
    isEmbedded: props.isEmbedded,
    idKey: by?.one,
    loadingOrError: loading || isLoading || !!error || props.y.wsStatus !== WebSocketStatus.Connected,
    locked: publishLocked || (props.y.data.locked as boolean | undefined | null) || false,
    archived: (props.y.data.archived as boolean | undefined | null) || false,
    hidden: (props.y.data.hidden as boolean | undefined | null) || false,
    processSchemaDef,
    renderFields,
    schemaDef,
  });
  actions = _actions;

  const stageDef = schemaDef.find(([key, def]) => key === 'stage')?.[1];

  const sidebarProps = {
    isEmbedded: props.isEmbedded,
    y: props.y,
    user: props.user,
    docInfo: {
      _id: item_id,
      createdAt: getProperty(props.y.data, 'timestamps.created_at'),
      modifiedAt: getProperty(props.y.data, 'timestamps.modified_at'),
      collectionName,
      tenant,
    },
    stage: stageDef
      ? {
          current: getProperty(props.y.data, 'stage'),
          options: schemaDef.find(([key, def]) => key === 'stage')?.[1].field?.options || [],
          key: 'stage',
        }
      : null,
    permissions:
      withPermissions === false ||
      getProperty(props.y.data, 'permissions.teams')?.includes('000000000000000000000000') ||
      getProperty(props.y.data, 'permissions.users')?.includes('000000000000000000000000')
        ? null
        : {
            users:
              getProperty(props.y.fullData, 'permissions.users')?.map(
                (user: {
                  value: string;
                  name?: string;
                  label?: string;
                  photo?: string;
                }): { _id: string; name: string; photo?: string; color: string } => ({
                  ...user,
                  _id: user.value,
                  name: user.name || user.label || 'User',
                  color: colorHash.hex(user.value || '0'),
                })
              ) || [],
            teams:
              getProperty(props.y.fullData, 'permissions.teams')
                ?.filter((_id: string | { value: string; label: string }) => !!_id)
                .map((value: string | { value: string; label: string }) => {
                  if (typeof value === 'string') {
                    return { _id: value, color: colorHash.hex(value || '0') };
                  }
                  return { _id: value.value, label: value.label, color: colorHash.hex(value.value || '0') };
                }) || [],
          },
    previewUrl: options?.previewUrl,
    dynamicPreviewUrl: options?.dynamicPreviewHref,
    disabled:
      locked ||
      loading ||
      isLoading ||
      !!error ||
      props.y.wsStatus !== WebSocketStatus.Connected ||
      isOldVersion,
    getFieldValues,
    hideVersions: isOldVersion,
  };

  // keep loading state synced
  const [lastAppLoading, setLastAppLoading] = useState(false);
  useEffect(() => {
    if (loading !== lastAppLoading) {
      setLastAppLoading(loading);
      dispatch(setAppLoading(loading));
    }
  }, [dispatch, lastAppLoading, loading]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName(title.replace(' - Cristata', '')));
  }, [dispatch, title]);
  useEffect(() => {
    if (isOldVersion) {
      dispatch(setAppActions([]));
    } else {
      dispatch(
        setAppActions([
          ...quickActions.map((action, index) => {
            return {
              label: action.label,
              type: action.type,
              icon: action.icon,
              action: action.action,
              color: action.color,
              disabled: action.disabled,
              'data-tip': action['data-tip'],
            };
          }),
          {
            label: 'More actions',
            type: 'icon',
            icon: 'MoreHorizontal24Regular',
            action: showActionDropdown,
          },
        ])
      );
    }
  }, [dispatch, props.y.awareness.length, quickActions, showActionDropdown, isOldVersion]);

  const { observe: contentRef, width: contentWidth } = useDimensions();

  if (schemaDef) {
    // go through the schemaDef and convert JSON types with mutliple fields to individual fields
    const JSONFields = schemaDef.filter(([key, def]) => def.type === 'JSON');

    // push subfields on JSON fields into the schemaDef array
    // so they can appear as regular fields in the UI
    // (subfields are schemaDefs for compatability)
    JSONFields.forEach(([key, def]) => {
      if (def.field?.custom && def.field.custom.length > 0) {
        // find the set of fields that are meant for this specific document
        // by finding a matching name or name === 'default'
        const match =
          def.field.custom.find(({ name }) => name === docName) ||
          def.field.custom.find(({ name }) => name === 'default');

        // push the matching subfields onto the schemaDef variable
        // so that they can appear in the UI
        if (match) {
          const defs = parseSchemaDefType(match.fields, key);
          schemaDef.push(...defs);
        }

        // and also hide the JSON field since it does not permit user interaction
        def.field.hidden = true;
      }
    });

    if (
      (props.y.wsStatus !== WebSocketStatus.Connected ||
        !props.y.synced ||
        JSON.stringify(props.y.data) === JSON.stringify({})) &&
      !navigator.onLine
    ) {
      return <Offline variant={'centered'} />;
    }

    const collaspedFields = processSchemaDef(schemaDef, false, { collapsed: true }).map(renderFields);

    return (
      <>
        {Windows}
        {!props.isEmbedded && !docNotFound ? (
          <ReactRouterPrompt
            when={(currentLocation, nextLocation) => {
              return (
                props.y.wsStatus !== WebSocketStatus.Connected &&
                currentLocation.pathname !== nextLocation.pathname
              );
            }}
          >
            {({ isActive, onConfirm, onCancel }) =>
              isActive ? (
                <PlainModal
                  title={'Lose your changes?'}
                  text={
                    'You are not connected. You have unsynced changes that may be lost. Leaving before you reconnect will result in data loss.'
                  }
                  hideModal={() => onCancel(true)}
                  cancelButton={{
                    text: 'Go back',
                    onClick: () => {
                      onCancel(true);
                      return true;
                    },
                  }}
                  continueButton={{
                    color: 'red',
                    text: 'Yes, potentially lose changes',
                    onClick: () => {
                      onConfirm(true);
                      return true;
                    },
                  }}
                />
              ) : null
            }
          </ReactRouterPrompt>
        ) : null}
        <FullScreenSplash
          isLoading={isMaximized && (!hasLoadedAtLeastOnce || isLoading) && !docNotFound}
          message={hasLoadedAtLeastOnce ? 'Checking permissions...' : 'Connecting to the server...'}
        />
        {docNotFound ? (
          <NotFound>
            <h2>
              This document does not exist <i>or</i> you do not have access.
            </h2>
            <p>If you know this document exists, ask someone with access to grant you access.</p>
          </NotFound>
        ) : !isLoading && hasLoadedAtLeastOnce ? (
          <ContentWrapper theme={theme} ref={contentRef}>
            <div style={{ minWidth: 0, overflow: 'auto', flexGrow: 1 }}>
              {previewUrl && !props.isEmbedded ? (
                <div>
                  <TabBar
                    activeTabIndex={tabIndex}
                    onActivate={(evt: { detail: { index: SetStateAction<number> } }) =>
                      setTabIndex(evt.detail.index)
                    }
                    style={{
                      borderBottom: `1px solid ${theme.color.neutral[theme.mode][200]}`,
                      backgroundColor: theme.mode === 'light' ? 'white' : theme.color.neutral[theme.mode][100],
                    }}
                  >
                    <Tab>Compose</Tab>
                    <Tab>Preview</Tab>
                  </TabBar>
                </div>
              ) : null}
              <div
                style={{
                  height: previewUrl ? 'calc(100% - 49px)' : '100%',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: tabIndex === 0 || !previewUrl ? 'block' : 'none', flexGrow: 1 }}>
                  {isOldVersion && !props.isEmbedded && fs !== '1' ? (
                    <Notice theme={theme}>
                      You are currently viewing an old version of this document. You cannot make edits.
                    </Notice>
                  ) : null}
                  {props.y.wsStatus !== WebSocketStatus.Connected &&
                  !props.isEmbedded &&
                  fs !== '1' &&
                  !isOldVersion ? (
                    <Notice theme={theme}>
                      <b>Currently not connected.</b> If you leave before your connection is restored, you may
                      lose data.
                    </Notice>
                  ) : null}
                  {publishLocked && !props.isEmbedded && fs !== '1' && !isOldVersion ? (
                    <Notice theme={theme}>
                      This document is opened in read-only mode because it has been published and you do not
                      have publish permissions.
                    </Notice>
                  ) : null}
                  {props.y.data.archived && !props.isEmbedded && fs !== '1' && !isOldVersion ? (
                    <Notice theme={theme}>
                      This document is opened in read-only mode because it is archived.
                      <Button
                        height={26}
                        cssExtra={css`
                          display: inline-block;
                          margin: 4px 8px;
                        `}
                        onClick={(e) => {
                          actions.find((a) => a.label === 'Remove from archive')?.action(e);
                        }}
                        disabled={actions.findIndex((a) => a.label === 'Remove from archive') === -1}
                      >
                        Remove from archive
                      </Button>
                    </Notice>
                  ) : null}
                  {props.y.data.hidden && !props.isEmbedded && fs !== '1' && !isOldVersion ? (
                    <Notice theme={theme}>
                      This document is opened in read-only mode because it is deleted.
                      <Button
                        height={26}
                        cssExtra={css`
                          display: inline-block;
                          margin: 4px 8px;
                        `}
                        onClick={(e) => {
                          actions.find((a) => a.label === 'Restore from deleted items')?.action(e);
                        }}
                        disabled={actions.findIndex((a) => a.label === 'Restore from deleted items') === -1}
                      >
                        Restore from deleted items
                      </Button>
                    </Notice>
                  ) : null}
                  {
                    /**
                     * published doc edit notice
                     */
                    (() => {
                      if (props.isEmbedded) return null;
                      if (fs === '1' || fs === 'force') return null;
                      if (isOldVersion) return null;

                      if (props.y.data._hasPublishedDoc) {
                        if (props.y.data.stage === publishStage) {
                          // show banner to switch to edit session
                          return (
                            <Notice theme={theme}>
                              This document is read-only mode because it is published. Begin an{' '}
                              <i>update session</i> to make edits.
                              <Button
                                height={26}
                                cssExtra={css`
                                  display: inline-block;
                                  margin: 4px 8px;
                                `}
                                onClick={(e) => {
                                  actions.find((a) => a.label === 'Begin update session')?.action(e);
                                }}
                                disabled={actions.findIndex((a) => a.label === 'Begin update session') === -1}
                              >
                                Begin update session
                              </Button>
                            </Notice>
                          );
                        }

                        // show notice that edit session is enabled
                        return (
                          <Notice theme={theme}>
                            You are in an <i>update session</i> for a currently published document. Your changes
                            will not appear to the public until you publish them.
                          </Notice>
                        );
                      }

                      // show alert that changes will affect the document immediately
                      if (props.y.data.stage === publishStage) {
                        return (
                          <Notice theme={theme}>
                            This document is currently published. Changes will be publically reflected
                            immediately.
                          </Notice>
                        );
                      }
                    })()
                  }

                  <div style={{ maxWidth: 800, padding: props.isEmbedded ? 0 : 40, margin: '0 auto' }}>
                    {contentWidth <= 700 ? <Sidebar {...sidebarProps} compact={true} /> : null}
                    {processSchemaDef(schemaDef, false, { collapsed: false }).map(renderFields)}

                    {isShowingCollapsed ? (
                      collaspedFields
                    ) : collaspedFields.length > 0 ? (
                      <Button onClick={() => setIsShowingCollapsed(true)}>Show all fields</Button>
                    ) : null}
                  </div>
                </div>
                {previewUrl && !props.isEmbedded && fs !== '1' ? (
                  <div style={{ display: tabIndex === 1 ? 'block' : 'none', flexGrow: 1, background: 'white' }}>
                    <PreviewFrame src={previewUrl} y={props.y} />
                  </div>
                ) : null}
              </div>
            </div>
            {!props.isEmbedded && contentWidth > 700 ? <Sidebar {...sidebarProps} /> : null}
          </ContentWrapper>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexDirection: 'column',
              alignItems: 'center',
              color: theme.color.neutral[theme.mode][1500],
              fontFamily: theme.font.detail,
              height: '100%',
              justifyContent: 'center',
            }}
          >
            <>
              <Spinner color={'neutral'} colorShade={1500} size={30} />
              {hasLoadedAtLeastOnce ? <div>Checking permissions...</div> : <div>Connecting...</div>}
            </>
          </div>
        )}
      </>
    );
  }

  return <p>hi</p>;
}

const ContentWrapper = styled.div<{ theme?: themeType }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;

  .collaboration-cursor__caret {
    position: relative;
    margin-left: -0.5px;
    margin-right: -0.5px;
    border-left: 0.5px solid #0d0d0d;
    border-right: 0.5px solid #0d0d0d;
    word-break: normal;
    pointer-events: none;
  }
  .collaboration-cursor__label {
    position: absolute;
    top: -1.4em;
    left: -1px;
    font-size: 12px;
    font-style: normal;
    font-weight: 680;
    line-height: normal;
    user-select: none;
    color: ${({ theme }) => theme.color.neutral['light'][1500]};
    font-family: ${({ theme }) => theme.font.detail};
    padding: 0.1rem 0.3rem;
    border-radius: 0;
    white-space: nowrap;
  }
`;

const EmbeddedFieldContainer = styled.div<{ theme: themeType; color?: colorType }>`
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  padding: 2px;
  height: 400px;
  overflow: auto;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus-within {
    outline: none;
    box-shadow: ${({ theme, color }) => {
        if (color === 'neutral') color = undefined;
        return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
      }}
      0px 0px 0px 2px inset;
  }
  .ProseMirror {
    &:focus {
      outline: none;
    }
  }
`;

const Notice = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  background-color: ${({ theme }) =>
    theme.mode === 'light' ? Color(theme.color.orange[800]).lighten(0.64).hex() : theme.color.orange[1400]};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  padding: 10px 20px;
  position: sticky;
  top: 0;
  margin: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
`;

const NotFound = styled.div`
  padding: 20px;
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
`;

export type RenderFields = (
  input: DeconstructedSchemaDefType[0],
  index: number,
  arr: DeconstructedSchemaDefType,
  inArrayKey?: string,
  yjsDocArrayConfig?: { __uuid: string; parentKey: string; childKey: string },
  isEmbedded?: boolean
) => JSX.Element;

export { CollectionItemPage, CollectionItemPageContent };
