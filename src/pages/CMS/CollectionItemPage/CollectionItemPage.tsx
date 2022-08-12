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
import { useY } from '../../../components/Tiptap/hooks';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import {
  DeconstructedSchemaDefType,
  parseSchemaDefType,
} from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { setField } from '../../../redux/slices/cmsItemSlice';
import { capitalize } from '../../../utils/capitalize';
import { server } from '../../../utils/constants';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { genAvatar } from '../../../utils/genAvatar';
import { isJSON } from '../../../utils/isJSON';
import { colorType, themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';
import { FullScreenSplash } from './FullScreenSplash';
import { Sidebar } from './Sidebar';
import { useActions } from './useActions';
import { useFindDoc } from './useFindDoc';
import { usePublishPermissions } from './usePublishPermissions';
import { useWatching } from './useWatching';

const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5 });

interface CollectionItemPageProps {
  isEmbedded?: boolean; // controls whether header, padding, tiptap, etc are hidden
}

function CollectionItemPage(props: CollectionItemPageProps) {
  const itemState = useAppSelector((state) => state.cmsItem);
  const authUserState = useAppSelector((state) => state.authUser);
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const { search } = useLocation();
  const navigate = useNavigate();
  let { collection, item_id } = useParams() as { collection: string; item_id: string };
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
  const { actionAccess, loading, error, refetch } = useFindDoc(
    uncapitalize(collectionName),
    item_id,
    schemaDef,
    withPermissions,
    props.isEmbedded || by === null || false,
    by?.one
  );

  const hasLoadedAtLeastOnce = JSON.stringify(itemState.fields) !== JSON.stringify({});

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
        docName = docName.replaceAll(`%${key}%`, getProperty(itemState.fields, key));
      }
    }
  } else {
    docName = getProperty(itemState.fields, options?.nameField || 'name') || docName;
  }
  if (docName.includes('undefined')) docName = collectionName;

  // set the document title
  const title = `${itemState.isUnsaved ? '*' : ''}${docName}${
    itemState.isUnsaved ? ' - Unsaved Changes' : ''
  } - Cristata`;
  if (document.title !== title) document.title = title;

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
  const y = useY({ name: pluralize.singular(collection) + item_id, user }); // create or load y

  // calculate publish permissions
  const {
    canPublish,
    publishLocked,
    lastStage: publishStage,
  } = usePublishPermissions({
    isPublishableCollection,
    itemStateFields: itemState.fields,
    schemaDef,
    publishActionAccess: actionAccess?.publish,
  });

  // fs search param
  const fs = new URLSearchParams(search).get('fs');

  // calculate user watching status
  const { isWatching, isMandatoryWatcher, mandatoryWatchersList } = useWatching({
    authUserState,
    itemStateFields: itemState.fields,
    mandatoryWatchersKeys: collectionOptions?.mandatoryWatchers || [],
  });

  // determine the actions for this document
  const { actions, quickActions, showActionDropdown, Windows } = useActions({
    y,
    actionAccess,
    canPublish,
    state: itemState,
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
    y,
    user,
    docInfo: {
      _id: getProperty(itemState.fields, by?.one || '_id'),
      createdAt: getProperty(itemState.fields, 'timestamps.created_at'),
      modifiedAt: getProperty(itemState.fields, 'timestamps.modified_at'),
    },
    stage: !!getProperty(itemState.fields, 'stage')
      ? {
          current: getProperty(itemState.fields, 'stage'),
          options: schemaDef.find(([key, def]) => key === 'stage')?.[1].field?.options || [],
          key: 'stage',
        }
      : null,
    permissions:
      withPermissions === false ||
      getProperty(itemState.fields, 'permissions.teams')?.includes('000000000000000000000000') ||
      getProperty(itemState.fields, 'permissions.users')?.includes('000000000000000000000000')
        ? null
        : {
            users:
              getProperty(itemState.fields, 'permissions.users')?.map(
                (user: {
                  _id: string;
                  name?: string;
                  label?: string;
                  photo?: string;
                }): { _id: string; name: string; photo?: string; color: string } => ({
                  ...user,
                  name: user.name || user.label || 'User',
                  color: colorHash.hex(user._id),
                })
              ) || [],
            teams:
              getProperty(itemState.fields, 'permissions.teams')
                ?.filter((_id: string | { _id: string; label: string }) => !!_id)
                .map((_id: string | { _id: string; label: string }) => {
                  if (typeof _id === 'string') {
                    return { _id, color: colorHash.hex(_id) };
                  }
                  return { _id: _id._id, label: _id.label, color: colorHash.hex(_id._id) };
                }) || [],
          },
    previewUrl: options?.previewUrl,
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

  const locked = publishLocked || (itemState.fields.archived as boolean);

  const { observe: contentRef, width: contentWidth } = useDimensions();

  if (schemaDef) {
    // go through the schemaDef and convert JSON types with mutliple fields to individual fields
    const JSONFields = schemaDef.filter(([key, def]) => def.type === 'JSON');

    // convert JSON data to POJO data in state
    JSONFields.forEach(([key]) => {
      if (isJSON(getProperty(itemState.fields, key))) {
        const parsed = JSON.parse(getProperty(itemState.fields, key));
        dispatch(setField(parsed, key, 'default', false));
      }
    });

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
        ? `__docArray.${yjsDocArrayConfig.parentKey}.${yjsDocArrayConfig.__uuid}.${yjsDocArrayConfig.childKey}`
        : undefined;

      // pass this to every collaborative field so it can communicate with yjs
      const fieldY = { ...y, field: docArrayYjsKey || key, user };

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
            initialData={getProperty(itemState.fields, key)}
            schemaDefs={processSchemaDef(def.docs)}
            processSchemaDef={processSchemaDef}
            renderFields={renderFields}
            onChange={(newValues) => {
              // do not pass `inArrayKey` because the state update for docarrays
              // already includes the entire array
              if (!readOnly) dispatch(setField(newValues, key, 'docarray'));
            }}
          />
        );
      }

      const type: MongooseSchemaType = isTypeTuple(def.type) ? def.type[1] : def.type;

      // do not render fields with # in their name
      // because they are private fields that are used
      // for various purposed not meant to be exposed
      // to users in the CMS UI
      if (key.includes('#')) return <></>;

      // body field as tiptap editor
      if (key === 'body' && def.field?.tiptap) {
        if (props.isEmbedded) return <></>;

        // get the HTML
        const isHTML = def.field.tiptap.isHTMLkey && getProperty(itemState.fields, def.field.tiptap.isHTMLkey);
        const html = isHTML ? (getProperty(itemState.fields, key) as string) : undefined;

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
                docName={`${collection}.${item_id}`}
                title={title}
                options={def.field.tiptap}
                isDisabled={
                  locked || itemState.isLoading || publishLocked ? true : isHTML ? true : def.field.readonly
                }
                showLoading={itemState.isLoading}
                html={html}
                isMaximized={fs === '1' || fs === 'force'}
                forceMax={fs === 'force'}
                onDebouncedChange={(editorJson, storedJson) => {
                  const isDefaultJson = editorJson === `[{"type":"paragraph","attrs":{"class":null}}]`;
                  if (!isDefaultJson && editorJson && editorJson !== storedJson) {
                    dispatch(setField(editorJson, key, 'tiptap', undefined, inArrayKey));
                  }
                }}
                currentJsonInState={
                  JSON.stringify(itemState.fields) === '{}' ? null : getProperty(itemState.fields, key)
                }
                actions={actions}
                layout={itemState.fields.layout}
                message={
                  publishLocked
                    ? 'This document is opened in read-only mode because it has been published and you do not have publish permissions.'
                    : itemState.fields.archived
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
          const stateValue = getProperty(itemState.fields, key);
          let rawValues: Record<string, string>[] = [];

          if (stateValue && Array.isArray(stateValue)) {
            rawValues = stateValue.map((val: string | number | Record<string, string>) => {
              if (typeof val === 'object') {
                return val;
              }
              return { _id: `${val}` };
            });
          }

          const values: { _id: string; label?: string }[] =
            rawValues
              .filter((s: Record<string, unknown>): s is Record<string, string> =>
                Object.keys(s).every(([, value]) => typeof value === 'string')
              )
              .map((value) => {
                const _id = value?.[def.field?.reference?.fields?._id || '_id'];
                const label = value?.[def.field?.reference?.fields?.name || 'name'];
                return { _id, label };
              }) || [];
          return (
            <CollaborativeReferenceMany
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              initialValues={values}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
              collection={pluralize.singular(collection)}
              reference={def.field?.reference}
              onChange={(newValues) => {
                if (newValues !== undefined && !readOnly)
                  dispatch(setField(newValues, key, 'reference', undefined, inArrayKey));
              }}
            />
          );
        }

        const value =
          getProperty(itemState.fields, key)?._id && getProperty(itemState.fields, key)?.label
            ? (getProperty(itemState.fields, key) as { _id: string; label: string })
            : getProperty(itemState.fields, key)?._id
            ? {
                _id: getProperty(itemState.fields, key)?._id,
                label: getProperty(itemState.fields, key)?.[def.field?.reference?.fields?.name || 'name'],
              }
            : typeof getProperty(itemState.fields, key) === 'string'
            ? { _id: getProperty(itemState.fields, key) }
            : undefined;

        return (
          <CollaborativeReferenceOne
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            // only show the value if it is truthy
            initialValue={value?._id ? value : undefined}
            color={props.isEmbedded ? 'blue' : 'primary'}
            // disable when the api requires the field to always have a value but a default
            // value for when no specific photo is selected is not defined
            disabled={locked || loading || !!error || readOnly || (def.required && def.default === undefined)}
            isEmbedded={props.isEmbedded}
            collection={pluralize.singular(collection)}
            reference={def.field?.reference}
            onChange={(newValue) => {
              const defaultValue = def.required ? def.default : null;
              if (!readOnly)
                dispatch(setField(newValue || defaultValue, key, 'reference', undefined, inArrayKey));
            }}
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
            initialValue={getProperty(itemState.fields, key)}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            onChange={(value) => {
              if (value !== undefined && !readOnly)
                dispatch(setField(value, key, 'default', undefined, inArrayKey));
            }}
          />
        );
      }

      // plain text fields
      if (type === 'String') {
        if (def.field?.options) {
          const currentPropertyValue = getProperty(itemState.fields, key);
          const options = def.field.options as StringOption[];
          return (
            <CollaborativeSelectOne
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              initialValue={options.find(({ value }) => value === currentPropertyValue)}
              options={options}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
              onChange={(value) => {
                const newValue = value?.value;
                if (newValue !== undefined && !readOnly)
                  dispatch(setField(newValue, key, 'default', undefined, inArrayKey));
              }}
            />
          );
        }
        return (
          <CollaborativeTextField
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            defaultValue={getProperty(itemState.fields, key)}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            onDebouncedChange={(content, text) => {
              if (text !== undefined && !readOnly)
                dispatch(setField(text, key, 'default', undefined, inArrayKey));
            }}
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
            defaultChecked={!!getProperty(itemState.fields, key)}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            onChange={(checked) => {
              if (checked !== undefined && !readOnly)
                dispatch(setField(checked, key, 'default', undefined, inArrayKey));
            }}
          />
        );
      }

      // integer fields
      if (type === 'Number') {
        if (def.field?.options) {
          const currentPropertyValue = getProperty(itemState.fields, key);
          const options = def.field.options.map((opt) => ({ ...opt, value: opt.toString() }));
          return (
            <CollaborativeSelectOne
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              initialValue={options.find(({ value }) => value === currentPropertyValue.toString())}
              options={options}
              number={'integer'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
              onChange={(value) => {
                const newValue = value?.value;
                if (newValue !== undefined && !readOnly)
                  dispatch(setField(parseInt(newValue), key, 'default', undefined, inArrayKey));
              }}
            />
          );
        }
        return (
          <CollaborativeNumberField
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            defaultValue={getProperty(itemState.fields, key)}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            onDebouncedChange={(content, number) => {
              if (number !== undefined && !readOnly)
                dispatch(setField(number, key, 'default', undefined, inArrayKey));
            }}
          />
        );
      }

      // float fields
      if (type === 'Float') {
        if (def.field?.options) {
          const currentPropertyValue = getProperty(itemState.fields, key);
          const options = def.field.options.map((opt) => ({ ...opt, value: opt.value.toString() }));
          return (
            <CollaborativeSelectOne
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              initialValue={options.find(({ value }) => value === currentPropertyValue.toString())}
              options={options}
              number={'decimal'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
              onChange={(value) => {
                const newValue = value?.value;
                if (newValue !== undefined && !readOnly)
                  dispatch(setField(parseFloat(newValue), key, 'default', undefined, inArrayKey));
              }}
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
            defaultValue={getProperty(itemState.fields, key)}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            onDebouncedChange={(content, number) => {
              if (number !== undefined && !readOnly)
                dispatch(setField(number, key, 'default', undefined, inArrayKey));
            }}
          />
        );
      }

      // array of strings
      if (type?.[0] === 'String') {
        const currentPropertyValues: string[] = getProperty(itemState.fields, key) || [];
        if (def.field?.options) {
          const options = def.field.options as StringOption[];
          return (
            <CollaborativeSelectMany
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              initialValues={options.filter(({ value }) => currentPropertyValues.includes(value))}
              options={options}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
              onChange={(values) => {
                const newValue = values.map(({ value }) => value);
                if (newValue !== undefined && !readOnly)
                  dispatch(setField(newValue, key, 'default', undefined, inArrayKey));
              }}
            />
          );
        }
        return (
          <CollaborativeSelectMany
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            initialValues={currentPropertyValues.map((value) => ({ value, label: value }))}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            onChange={(values) => {
              const newValue = values.map(({ value }) => value);
              if (newValue !== undefined && !readOnly)
                dispatch(setField(newValue, key, 'default', undefined, inArrayKey));
            }}
          />
        );
      }

      // array of integers
      if (type?.[0] === 'Number') {
        const currentPropertyValues: number[] = getProperty(itemState.fields, key) || [];
        if (def.field?.options) {
          const options = def.field.options as StringOption[];
          return (
            <CollaborativeSelectMany
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              initialValues={options.filter(({ value }) => currentPropertyValues.includes(parseInt(value)))}
              options={options}
              number={'integer'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
              onChange={(values) => {
                const newValue = values.map(({ value }) => parseInt(value));
                if (newValue !== undefined && !readOnly)
                  dispatch(setField(newValue, key, 'default', undefined, inArrayKey));
              }}
            />
          );
        }
        return (
          <CollaborativeSelectMany
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            initialValues={currentPropertyValues.map((value) => ({
              value: value.toString(),
              label: value.toString(),
            }))}
            number={'integer'}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            onChange={(values) => {
              const newValue = values.map(({ value }) => parseInt(value));
              if (newValue !== undefined && !readOnly)
                dispatch(setField(newValue, key, 'default', undefined, inArrayKey));
            }}
          />
        );
      }

      // array of floats
      if (type?.[0] === 'Float') {
        const currentPropertyValues: number[] = getProperty(itemState.fields, key) || [];
        if (def.field?.options) {
          const options = def.field.options as StringOption[];
          return (
            <CollaborativeSelectMany
              key={index}
              label={fieldName}
              description={def.field?.description}
              y={fieldY}
              initialValues={options.filter(({ value }) => currentPropertyValues.includes(parseFloat(value)))}
              options={options}
              number={'decimal'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={locked || loading || !!error || readOnly}
              isEmbedded={props.isEmbedded}
              onChange={(values) => {
                const newValue = values.map(({ value }) => parseFloat(value));
                if (newValue !== undefined && !readOnly)
                  dispatch(setField(newValue, key, 'default', undefined, inArrayKey));
              }}
            />
          );
        }
        return (
          <CollaborativeSelectMany
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            initialValues={currentPropertyValues.map((value) => ({
              value: value.toString(),
              label: value.toString(),
            }))}
            number={'decimal'}
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            onChange={(values) => {
              const newValue = values.map(({ value }) => parseFloat(value));
              if (newValue !== undefined && !readOnly)
                dispatch(setField(newValue, key, 'default', undefined, inArrayKey));
            }}
          />
        );
      }

      // plain text fields
      if (type === 'Date') {
        const currentTimestamp: string | undefined = getProperty(itemState.fields, key);
        return (
          <CollaborativeDateTime
            key={index}
            label={fieldName}
            description={def.field?.description}
            y={fieldY}
            initialValue={
              !currentTimestamp || currentTimestamp === '0001-01-01T01:00:00.000Z' ? null : currentTimestamp
            }
            color={props.isEmbedded ? 'blue' : 'primary'}
            disabled={locked || loading || !!error || readOnly}
            isEmbedded={props.isEmbedded}
            placeholder={'Pick a time'}
            onChange={(date) => {
              if (date && !readOnly)
                dispatch(setField(date.toUTC().toISO(), key, 'default', undefined, inArrayKey));
            }}
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

    if ((!itemState || JSON.stringify(itemState.fields) === JSON.stringify({})) && !navigator.onLine) {
      return <Offline variant={'centered'} />;
    }

    return (
      <>
        {Windows}
        <ReactRouterPrompt when={itemState.isUnsaved}>
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
        {!props.isEmbedded && (fs === 'force' || fs === '1') ? null : null}
        <FullScreenSplash isLoading={(fs === 'force' || fs === '1') && !hasLoadedAtLeastOnce} />
        {itemState.isLoading && !hasLoadedAtLeastOnce ? null : (
          <ContentWrapper theme={theme} ref={contentRef}>
            <div style={{ minWidth: 0, overflow: 'auto', flexGrow: 1 }}>
              {publishLocked && !props.isEmbedded && fs !== '1' ? (
                <Notice theme={theme}>
                  This document is opened in read-only mode because it has been published and you do not have
                  publish permissions.
                </Notice>
              ) : null}
              {itemState.fields.archived && !props.isEmbedded && fs !== '1' ? (
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

export { CollectionItemPage };
