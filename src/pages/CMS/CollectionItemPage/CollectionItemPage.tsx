import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  isTypeTuple,
  MongooseSchemaType,
  StringOption,
} from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import Color from 'color';
import ColorHash from 'color-hash';
import { get as getProperty } from 'object-path';
import pluralize from 'pluralize';
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
  CollaborativeTextField,
} from '../../../components/CollaborativeFields';
import { Field } from '../../../components/ContentField/Field';
import { PlainModal } from '../../../components/Modal';
import { Offline } from '../../../components/Offline';
import { Tiptap } from '../../../components/Tiptap';
import { useAwareness, useY } from '../../../components/Tiptap/hooks';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import {
  DeconstructedSchemaDefType,
  parseSchemaDefType,
} from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { capitalize } from '../../../utils/capitalize';
import { server } from '../../../utils/constants';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType, themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';
import { FullScreenSplash } from './FullScreenSplash';
import { getYFields, GetYFieldsOptions } from './getYFields';
import { Sidebar } from './Sidebar';
import { useActions } from './useActions';
import { useFindDoc } from './useFindDoc';
import { usePublishPermissions } from './usePublishPermissions';
import { useWatching } from './useWatching';

const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5 });

interface CollectionItemPageProps {}

function CollectionItemPage(props: CollectionItemPageProps) {
  const authUserState = useAppSelector((state) => state.authUser);
  let { collection, item_id } = useParams() as { collection: string; item_id: string };
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // get the current tenant name
  const tenant = localStorage.getItem('tenant');

  // create a user object for the current user (for yjs)
  const user = {
    name: authUserState.name,
    color: colorHash.hex(authUserState._id),
    sessionId: sessionId || '',
    photo: `${server.location}/v3/${tenant}/user-photo/${authUserState._id}` || genAvatar(authUserState._id),
  };

  // connect to other clients with yjs for collaborative editing
  const [{ schemaDef }] = useCollectionSchemaConfig(collectionName);
  const y = useY({ collection: pluralize.singular(collection), id: item_id, user, schemaDef }); // create or load y

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
  let { collection, item_id } = useParams() as { collection: string; item_id: string };
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));
  const isUnsaved = props.y.unsavedFields.length !== 0;
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

  // function to get the values of the fields that can be used
  // when sending changes to the database or opening previews
  const getFieldValues = (opts: GetYFieldsOptions) => getYFields(props.y, schemaDef, opts);

  // put the document in redux state and ydoc
  const { actionAccess, loading, error, refetch } = useFindDoc(
    uncapitalize(collectionName),
    item_id,
    schemaDef,
    withPermissions,
    props.isEmbedded || by === null || false,
    by?.one,
    props.y
  );

  const hasLoadedAtLeastOnce = JSON.stringify(props.y.data) !== JSON.stringify({});

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
  const title = `${isUnsaved ? '*' : ''}${docName}${isUnsaved ? ' - Unsaved Changes' : ''} - Cristata`;
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

  // determine the actions for this document
  const { actions, quickActions, showActionDropdown, Windows } = useActions({
    y: props.y,
    actionAccess,
    canPublish,
    collectionName,
    itemId: item_id,
    dispatch,
    refetchData: refetch,
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
  });

  const sidebarProps = {
    isEmbedded: props.isEmbedded,
    y: props.y,
    user: props.user,
    docInfo: {
      _id: getProperty(props.y.data, by?.one || '_id'),
      createdAt: getProperty(props.y.data, 'timestamps.created_at'),
      modifiedAt: getProperty(props.y.data, 'timestamps.modified_at'),
    },
    stage: !!getProperty(props.y.data, 'stage')
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
    getFieldValues,
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
          onAuxClick: () => refetch(),
        },
      ])
    );
  }, [dispatch, quickActions, refetch, showActionDropdown]);

  const locked = publishLocked || (props.y.data.archived as boolean | undefined | null) || false;

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

    const processSchemaDef = (schemaDef: DeconstructedSchemaDefType): DeconstructedSchemaDefType => {
      return (
        schemaDef
          // sort fields to match their order
          .sort((a, b) => {
            if ((a[1].field?.order || 1000) > (b[1].field?.order || 1000)) return 1;
            return -1;
          })
          // hide hidden fields
          .filter(([, def]) => {
            return def.field?.hidden !== true;
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
      );
    };

    const renderFields = (
      input: DeconstructedSchemaDefType[0],
      index: number,
      arr: DeconstructedSchemaDefType,
      inArrayKey?: string,
      yjsDocArrayConfig?: { __uuid: string; parentKey: string; childKey: string }
    ): JSX.Element => {
      const [key, def] = input;

      const readOnly = def.field?.readonly === true || def.modifiable !== true;
      let fieldName = def.field?.label || key;

      // if a field is readonly, add readonly to the field name
      if (readOnly) fieldName += ' (read only)';

      // use this key for yjs shared type key for doc array contents
      // so there shared type for each field in the array is unique
      // for the array and array doc
      const docArrayYjsKey = yjsDocArrayConfig
        ? `__docArray.‾‾${yjsDocArrayConfig.parentKey}‾‾.${yjsDocArrayConfig.__uuid}.${yjsDocArrayConfig.childKey}`
        : undefined;

      // pass this to every collaborative field so it can communicate with yjs
      const fieldY = { ...props.y, field: docArrayYjsKey || key, user: props.user };

      const isSubDocArray = def.type === 'DocArray';
      if (isSubDocArray) {
        // do not show hidden subdoc arrays
        const isHidden =
          def.docs.find(([subkey, def]) => subkey === `${key}.#label`)?.[1].field?.hidden || false;
        if (isHidden) return <Fragment key={index}></Fragment>;

        const label = def.docs.find(([subkey, def]) => subkey === `${key}.#label`)?.[1].field?.label || key;
        const description = def.docs.find(([subkey, def]) => subkey === `${key}.#label`)?.[1].field
          ?.description;
        return (
          <CollaborativeDocArray
            y={fieldY}
            label={label}
            description={description}
            disabled={locked || loading || !!error || readOnly}
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
      // if (isMaximized && !(key === 'body' && def.field?.tiptap) && !props.isEmbedded) {
      //   return <></>;
      // }

      // body field as tiptap editor
      if (key === 'body' && def.field?.tiptap) {
        if (props.isEmbedded) return <></>;

        // get the HTML
        const isHTML = def.field.tiptap.isHTMLkey && getProperty(props.y.data, def.field.tiptap.isHTMLkey);

        return (
          <Field
            key={index}
            color={props.isEmbedded ? 'blue' : 'primary'}
            label={fieldName}
            description={def.field?.description}
            isEmbedded={props.isEmbedded}
          >
            <EmbeddedFieldContainer theme={theme}>
              <Tiptap
                y={fieldY}
                user={props.user}
                docName={`${collection}.${item_id}`}
                title={title}
                options={def.field.tiptap}
                isDisabled={locked || isLoading || publishLocked ? true : isHTML ? true : def.field.readonly}
                showLoading={isLoading}
                isMaximized={isMaximized}
                forceMax={fs === 'force'}
                actions={actions}
                layout={`${props.y.data.layout}`}
                message={
                  publishLocked
                    ? 'This document is opened in read-only mode because it has been published and you do not have publish permissions.'
                    : props.y.data.archived
                    ? 'This document is opened in read-only mode because it is archived. Remove it from the archive to edit.'
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
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
              collection={pluralize.singular(collection)}
              reference={def.field?.reference}
            />
          );
        }

        return (
          <CollaborativeReferenceOne
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            // only show the value if it is truthy
            color={props.isEmbedded ? 'blue' : 'primary'}
            // disable when the api requires the field to always have a value but a default
            // value for when no specific photo is selected is not defined
            disabled={locked || loading || !!error || readOnly || (def.required && def.default === undefined)}
            isEmbedded={props.isEmbedded}
            collection={pluralize.singular(collection)}
            reference={def.field?.reference}
          />
        );
      }

      // markdown fields
      if (type === 'String' && def.field?.markdown) {
        return (
          <CollaborativeCode
            key={index}
            label={fieldName}
            description={def.field?.description}
            type={'md'}
            y={fieldY}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
          />
        );
      }

      // plain text fields
      if (type === 'String') {
        if (def.field?.options) {
          const options = def.field.options as StringOption[];
          return (
            <CollaborativeSelectOne
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              options={options}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
            />
          );
        }

        return (
          <CollaborativeTextField
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
          />
        );
      }

      // checkbox
      if (type === 'Boolean') {
        return (
          <CollaborativeCheckbox
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
          />
        );
      }

      // integer fields
      if (type === 'Number') {
        if (def.field?.options) {
          const options = def.field.options.map((opt) => ({ ...opt, value: opt.toString() }));
          return (
            <CollaborativeSelectOne
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              options={options}
              number={'integer'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
            />
          );
        }
        return (
          <CollaborativeNumberField
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
          />
        );
      }

      // float fields
      if (type === 'Float') {
        if (def.field?.options) {
          const options = def.field.options.map((opt) => ({ ...opt, value: opt.value.toString() }));
          return (
            <CollaborativeSelectOne
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              options={options}
              number={'decimal'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
            />
          );
        }
        return (
          <CollaborativeNumberField
            key={index}
            label={fieldName}
            allowDecimals
            description={def.field?.description}
            y={fieldY}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
          />
        );
      }

      // array of strings
      if (type?.[0] === 'String') {
        if (def.field?.options) {
          const options = def.field.options as StringOption[];
          return (
            <CollaborativeSelectMany
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              options={options}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
            />
          );
        }
        return (
          <CollaborativeSelectMany
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
          />
        );
      }

      // array of integers
      if (type?.[0] === 'Number') {
        if (def.field?.options) {
          const options = def.field.options as StringOption[];
          return (
            <CollaborativeSelectMany
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              options={options}
              number={'integer'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
            />
          );
        }
        return (
          <CollaborativeSelectMany
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            number={'integer'}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
          />
        );
      }

      // array of floats
      if (type?.[0] === 'Float') {
        if (def.field?.options) {
          const options = def.field.options as StringOption[];
          return (
            <CollaborativeSelectMany
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              options={options}
              number={'decimal'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
            />
          );
        }
        return (
          <CollaborativeSelectMany
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            number={'decimal'}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
          />
        );
      }

      // plain text fields
      if (type === 'Date') {
        return (
          <CollaborativeDateTime
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            placeholder={'Pick a time'}
          />
        );
      }

      // fallback
      return (
        <Field
          key={index}
          color={props.isEmbedded ? 'blue' : 'primary'}
          label={fieldName}
          description={def.field?.description}
          isEmbedded={props.isEmbedded}
        >
          <code>{JSON.stringify(def, null, 2)}</code>
        </Field>
      );
    };

    if (
      (!props.y.connected || !props.y.initialSynced || JSON.stringify(props.y.data) === JSON.stringify({})) &&
      !navigator.onLine
    ) {
      return <Offline variant={'centered'} />;
    }

    return (
      <>
        {Windows}
        <ReactRouterPrompt when={isUnsaved}>
          {({ isActive, onConfirm, onCancel }) =>
            isActive ? (
              <PlainModal
                title={'Are you sure?'}
                text={'You have unsaved changes that may be lost.'}
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
                  text: 'Yes, discard changes',
                  onClick: () => {
                    onConfirm(true);
                    return true;
                  },
                }}
              />
            ) : null
          }
        </ReactRouterPrompt>
        {!props.isEmbedded && isMaximized ? null : null}
        <FullScreenSplash isLoading={isMaximized && !hasLoadedAtLeastOnce} />
        {isLoading && !hasLoadedAtLeastOnce ? null : (
          <ContentWrapper theme={theme} ref={contentRef}>
            <div style={{ minWidth: 0, overflow: 'auto', flexGrow: 1 }}>
              {publishLocked && !props.isEmbedded && fs !== '1' ? (
                <Notice theme={theme}>
                  This document is opened in read-only mode because it has been published and you do not have
                  publish permissions.
                </Notice>
              ) : null}
              {props.y.data.archived && !props.isEmbedded && fs !== '1' ? (
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
              <div style={{ maxWidth: 800, padding: props.isEmbedded ? 0 : 40, margin: '0 auto' }}>
                {contentWidth <= 700 ? <Sidebar {...sidebarProps} compact={true} /> : null}
                {processSchemaDef(schemaDef).map(renderFields)}
              </div>
            </div>
            {contentWidth <= 700 ? null : <Sidebar {...sidebarProps} />}
          </ContentWrapper>
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

export { CollectionItemPage, CollectionItemPageContent };
