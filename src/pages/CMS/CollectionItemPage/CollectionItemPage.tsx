import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { MoreHorizontal24Regular } from '@fluentui/react-icons';
import {
  isTypeTuple,
  MongooseSchemaType,
  NumberOption,
  StringOption,
} from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import Color from 'color';
import ColorHash from 'color-hash';
import { get as getProperty } from 'object-path';
import pluralize from 'pluralize';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Button, IconButton } from '../../../components/Button';
import {
  Checkbox,
  DateTime,
  Number,
  ReferenceMany,
  ReferenceOne,
  SelectMany,
  SelectOne,
  Text,
} from '../../../components/ContentField';
import { Field } from '../../../components/ContentField/Field';
import { PageHead } from '../../../components/PageHead';
import { Tiptap } from '../../../components/Tiptap';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setField } from '../../../redux/slices/cmsItemSlice';
import { capitalize } from '../../../utils/capitalize';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType, themeType } from '../../../utils/theme/theme';
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
  const collectionName = capitalize(pluralize.singular(collection));
  const [{ schemaDef, nameField, canPublish: isPublishableCollection, options: collectionOptions }] =
    useCollectionSchemaConfig(collectionName);
  const { actionAccess, loading, error, refetch } = useFindDoc(collection, item_id, schemaDef);
  const hasLoadedAtLeastOnce = JSON.stringify(itemState.fields) !== JSON.stringify({});

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // set the document title
  const title = `${itemState.isUnsaved ? '*' : ''}${
    getProperty(itemState.fields, nameField || 'name') || item_id
  } - Cristata`;
  if (document.title !== title) document.title = title;

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // calculate publish permissions
  const { canPublish, publishLocked } = usePublishPermissions({
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
  const { actions, quickActions, showActionDropdown } = useActions({
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
  });

  if (schemaDef) {
    return (
      <>
        {props.isEmbedded ? null : (
          <PageHead
            title={title.replace(' - Cristata', '')}
            buttons={
              <>
                {quickActions.map((action, index) => {
                  return (
                    <span data-tip={action['data-tip']} key={index}>
                      <Button
                        onClick={action.action}
                        icon={action.icon}
                        color={action.color}
                        disabled={action.disabled}
                        data-tip={action['data-tip']}
                      >
                        {action.label}
                      </Button>
                    </span>
                  );
                })}
                <IconButton
                  onClick={showActionDropdown}
                  onAuxClick={() => refetch()}
                  icon={<MoreHorizontal24Regular />}
                  data-tip={'More actions'}
                />
              </>
            }
            isLoading={itemState.isLoading}
          />
        )}
        {itemState.isLoading && !hasLoadedAtLeastOnce ? null : (
          <ContentWrapper theme={theme}>
            <div style={{ minWidth: 0, overflow: 'auto', flexGrow: 1 }}>
              {publishLocked && !props.isEmbedded && !fs ? (
                <Notice theme={theme}>
                  This document is opened in read-only mode because it has been published and you do not have
                  publish permissions.
                </Notice>
              ) : null}
              <div style={{ maxWidth: 800, padding: props.isEmbedded ? 0 : 40, margin: '0 auto' }}>
                {schemaDef
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
                    return true;
                  })
                  // return the correct input
                  .map(([key, def], index) => {
                    const type: MongooseSchemaType = isTypeTuple(def.type) ? def.type[1] : def.type;
                    const readOnly = def.field?.readonly === true;
                    let fieldName = def.field?.label || key;

                    // if a field is readonly, add readonly to the field name
                    if (readOnly) fieldName += ' (read only)';

                    // body field as tiptap editor
                    if (key === 'body' && def.field?.tiptap) {
                      if (props.isEmbedded) return <></>;

                      // get the HTML
                      const isHTML =
                        def.field.tiptap.isHTMLkey && getProperty(itemState.fields, def.field.tiptap.isHTMLkey);
                      const html = isHTML ? (getProperty(itemState.fields, key) as string) : undefined;

                      return (
                        <Field
                          key={index}
                          label={fieldName}
                          description={def.field?.description}
                          isEmbedded={props.isEmbedded}
                        >
                          <EmbeddedFieldContainer theme={theme}>
                            <Tiptap
                              docName={`${collection}.${item_id}`}
                              title={title}
                              user={{
                                name: authUserState.name,
                                color: colorHash.hex(authUserState._id),
                                photo:
                                  `${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/v3/user-photo/${authUserState._id}` ||
                                  genAvatar(authUserState._id),
                              }}
                              options={def.field.tiptap}
                              isDisabled={
                                itemState.isLoading || publishLocked ? true : isHTML ? true : def.field.readonly
                              }
                              showLoading={itemState.isLoading}
                              sessionId={sessionId || ''}
                              html={html}
                              isMaximized={fs === '1' || fs === 'force'}
                              forceMax={fs === 'force'}
                              onDebouncedChange={(editorJson, storedJson) => {
                                const isDefaultJson =
                                  editorJson === `[{"type":"paragraph","attrs":{"class":null}}]`;
                                if (!isDefaultJson && storedJson !== null && editorJson !== storedJson) {
                                  dispatch(setField(editorJson, key, 'tiptap'));
                                }
                              }}
                              currentJsonInState={
                                JSON.stringify(itemState.fields) === '{}'
                                  ? null
                                  : getProperty(itemState.fields, key)
                              }
                              actions={actions}
                              layout={itemState.fields.layout}
                              message={
                                publishLocked
                                  ? 'This document is opened in read-only mode because it has been published and you do not have publish permissions.'
                                  : undefined
                              }
                              useNewCollectionItemPage
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
                        const rawValues: Record<string, string>[] = (
                          getProperty(itemState.fields, key) &&
                          Array.isArray(getProperty(itemState.fields, key))
                            ? getProperty(itemState.fields, key)
                            : []
                        ).filter((s: Record<string, unknown>): s is Record<string, string> =>
                          Object.keys(s).every(([, value]) => typeof value === 'string')
                        );
                        const values: { _id: string; label?: string }[] =
                          rawValues.map((value) => {
                            const _id = value?.[def.field?.reference?.fields._id || '_id'];
                            const label = value?.[def.field?.reference?.fields.name || 'name'];
                            return { _id, label };
                          }) || [];

                        return (
                          <ReferenceMany
                            key={index}
                            label={fieldName}
                            description={def.field?.description}
                            values={values}
                            disabled={loading || !!error}
                            isEmbedded={props.isEmbedded}
                            collection={pluralize.singular(collection)}
                            fields={def.field?.reference?.fields}
                            onChange={(newValues) => {
                              if (newValues !== undefined && !readOnly)
                                dispatch(setField(newValues, key, 'reference'));
                            }}
                          />
                        );
                      }

                      const value =
                        getProperty(itemState.fields, key)?._id && getProperty(itemState.fields, key)?.label
                          ? (getProperty(itemState.fields, key) as { _id: string; label: string })
                          : getProperty(itemState.fields, key)?._id ||
                            typeof getProperty(itemState.fields, key) === 'string'
                          ? { _id: getProperty(itemState.fields, key) }
                          : undefined;

                      return (
                        <ReferenceOne
                          key={index}
                          label={fieldName}
                          description={def.field?.description}
                          // only show the value if it is not null, undefined, or an empty string
                          value={value?._id ? value : null}
                          // disable when the api requires the field to always have a value but a default
                          // value for when no specific photo is selected is not defined
                          disabled={loading || !!error || (def.required && def.default === undefined)}
                          isEmbedded={props.isEmbedded}
                          collection={pluralize.singular(collection)}
                          fields={def.field?.reference?.fields}
                          onChange={(newValue) => {
                            if (newValue !== undefined && !readOnly)
                              dispatch(setField(newValue || def.default, key, 'reference'));
                          }}
                        />
                      );
                    }

                    // plain text fields
                    if (type === 'String') {
                      if (def.field?.options) {
                        const currentPropertyValue = getProperty(itemState.fields, key);
                        const options = def.field.options as NumberOption[];
                        return (
                          <SelectOne
                            key={index}
                            type={'String'}
                            options={options}
                            label={fieldName}
                            description={def.field.description}
                            value={options.find(({ value }) => value === currentPropertyValue)}
                            onChange={(value) => {
                              const newValue = value?.value;
                              if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                            }}
                            disabled={loading || !!error}
                            isEmbedded={props.isEmbedded}
                          />
                        );
                      }
                      return (
                        <Text
                          key={index}
                          label={fieldName}
                          description={def.field?.description}
                          value={getProperty(itemState.fields, key)}
                          disabled={loading || !!error}
                          isEmbedded={props.isEmbedded}
                          onChange={(e) => {
                            const newValue = e.currentTarget.value;
                            if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                          }}
                        />
                      );
                    }

                    // checkbox
                    if (type === 'Boolean') {
                      return (
                        <Checkbox
                          key={index}
                          label={fieldName}
                          description={def.field?.description}
                          checked={!!getProperty(itemState.fields, key)}
                          disabled={loading || !!error}
                          isEmbedded={props.isEmbedded}
                          onChange={(e) => {
                            const newValue = e.currentTarget.checked;
                            if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                          }}
                        />
                      );
                    }

                    // integer fields
                    if (type === 'Number') {
                      if (def.field?.options) {
                        const currentPropertyValue = getProperty(itemState.fields, key);
                        const options = def.field.options as NumberOption[];
                        return (
                          <SelectOne
                            key={index}
                            type={'Int'}
                            options={options}
                            label={fieldName}
                            description={def.field?.description}
                            value={options.find(({ value }) => value === currentPropertyValue)}
                            onChange={(value) => {
                              const newValue = value?.value;
                              if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                            }}
                            disabled={loading || !!error}
                            isEmbedded={props.isEmbedded}
                          />
                        );
                      }
                      return (
                        <Number
                          key={index}
                          type={'Int'}
                          label={fieldName}
                          description={def.field?.description}
                          value={getProperty(itemState.fields, key)}
                          disabled={loading || !!error}
                          isEmbedded={props.isEmbedded}
                          onChange={(e) => {
                            const newValue = e.currentTarget.valueAsNumber;
                            if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                          }}
                        />
                      );
                    }

                    // float fields
                    if (type === 'Float') {
                      if (def.field?.options) {
                        const currentPropertyValue = getProperty(itemState.fields, key);
                        const options = def.field.options as NumberOption[];
                        return (
                          <SelectOne
                            key={index}
                            type={'Float'}
                            options={options}
                            label={fieldName}
                            description={def.field?.description}
                            value={options.find(({ value }) => value === currentPropertyValue)}
                            onChange={(value) => {
                              const newValue = value?.value;
                              if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                            }}
                            disabled={loading || !!error}
                            isEmbedded={props.isEmbedded}
                          />
                        );
                      }
                      return (
                        <Number
                          key={index}
                          type={'Float'}
                          label={fieldName}
                          description={def.field?.description}
                          value={getProperty(itemState.fields, key)}
                          disabled={loading || !!error}
                          isEmbedded={props.isEmbedded}
                          onChange={(e) => {
                            const newValue = e.currentTarget.valueAsNumber;
                            if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
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
                          <SelectMany
                            key={index}
                            type={'Float'}
                            options={options}
                            label={fieldName}
                            description={def.field?.description}
                            values={options.filter(({ value }) => currentPropertyValues.includes(value))}
                            onChange={(values) => {
                              const newValue = values.map(({ value }) => value);
                              if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                            }}
                            disabled={loading || !!error}
                            isEmbedded={props.isEmbedded}
                          />
                        );
                      }
                      return (
                        <SelectMany
                          key={index}
                          type={'String'}
                          label={fieldName}
                          description={def.field?.description}
                          values={currentPropertyValues.map((value) => ({ value, label: value }))}
                          onChange={(values) => {
                            const newValue = values.map(({ value }) => value);
                            if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                          }}
                          disabled={loading || !!error}
                          isEmbedded={props.isEmbedded}
                        />
                      );
                    }

                    // array of integers
                    if (type?.[0] === 'Number') {
                      const currentPropertyValues: number[] = getProperty(itemState.fields, key) || [];
                      if (def.field?.options) {
                        const options = def.field.options as StringOption[];
                        return (
                          <SelectMany
                            key={index}
                            type={'Int'}
                            options={options}
                            label={fieldName}
                            description={def.field?.description}
                            values={options.filter(({ value }) =>
                              currentPropertyValues.map((value) => value.toString()).includes(value)
                            )}
                            onChange={(values) => {
                              const newValue = values.map(({ value }) => value);
                              if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                            }}
                            disabled={loading || !!error}
                            isEmbedded={props.isEmbedded}
                          />
                        );
                      }
                      return (
                        <SelectMany
                          key={index}
                          type={'Int'}
                          label={fieldName}
                          description={def.field?.description}
                          values={currentPropertyValues.map((value) => ({ value, label: value.toString() }))}
                          onChange={(values) => {
                            const newValue = values.map(({ value }) => value);
                            if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                          }}
                          disabled={loading || !!error}
                          isEmbedded={props.isEmbedded}
                        />
                      );
                    }

                    // array of floats
                    if (type?.[0] === 'Float') {
                      const currentPropertyValues: number[] = getProperty(itemState.fields, key) || [];
                      if (def.field?.options) {
                        const options = def.field.options as StringOption[];
                        return (
                          <SelectMany
                            key={index}
                            type={'Float'}
                            options={options}
                            label={fieldName}
                            description={def.field?.description}
                            values={options.filter(({ value }) =>
                              currentPropertyValues.map((value) => value.toString()).includes(value)
                            )}
                            onChange={(values) => {
                              const newValue = values.map(({ value }) => value);
                              if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                            }}
                            disabled={loading || !!error}
                            isEmbedded={props.isEmbedded}
                          />
                        );
                      }
                      return (
                        <SelectMany
                          key={index}
                          type={'Float'}
                          label={fieldName}
                          description={def.field?.description}
                          values={currentPropertyValues.map((value) => ({ value, label: value.toString() }))}
                          onChange={(values) => {
                            const newValue = values.map(({ value }) => value);
                            if (newValue !== undefined && !readOnly) dispatch(setField(newValue, key));
                          }}
                          disabled={loading || !!error}
                          isEmbedded={props.isEmbedded}
                        />
                      );
                    }

                    // plain text fields
                    if (type === 'Date') {
                      const currentTimestamp: string | undefined = getProperty(itemState.fields, key);
                      return (
                        <DateTime
                          key={index}
                          label={fieldName}
                          description={def.field?.description}
                          value={
                            !currentTimestamp || currentTimestamp === '0001-01-01T01:00:00.000Z'
                              ? null
                              : currentTimestamp
                          }
                          onChange={(date) => {
                            if (date && !readOnly) dispatch(setField(date.toUTC().toISO(), key));
                          }}
                          placeholder={'Pick a time'}
                          disabled={loading || !!error}
                          isEmbedded={props.isEmbedded}
                        />
                      );
                    }

                    // fallback
                    return (
                      <Field
                        key={index}
                        label={fieldName}
                        description={def.field?.description}
                        isEmbedded={props.isEmbedded}
                      >
                        <code>{JSON.stringify(def, null, 2)}</code>
                      </Field>
                    );
                  })}
              </div>
            </div>
            {props.isEmbedded ? null : (
              <Sidebar
                docInfo={{
                  _id: getProperty(itemState.fields, '_id'),
                  createdAt: getProperty(itemState.fields, 'timestamps.created_at'),
                  modifiedAt: getProperty(itemState.fields, 'timestamps.modified_at'),
                }}
                stage={{
                  current: getProperty(itemState.fields, 'stage'),
                  options: schemaDef.find(([key, def]) => key === 'stage')?.[1].field?.options || [],
                  key: 'stage',
                }}
                permissions={{
                  users:
                    getProperty(itemState.fields, 'permissions.users')?.map(
                      (user: {
                        _id: string;
                        name: string;
                        photo?: string;
                      }): { _id: string; name: string; photo?: string; color: string } => ({
                        ...user,
                        color: colorHash.hex(user._id),
                      })
                    ) || [],
                  teams:
                    getProperty(itemState.fields, 'permissions.teams')
                      ?.filter((_id: string) => !!_id)
                      .map((_id: string) => ({ _id, color: colorHash.hex(_id) })) || [],
                }}
              />
            )}
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
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
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
