import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  ArrowClockwise24Regular,
  CloudArrowUp24Regular,
  Delete24Regular,
  EyeHide24Regular,
  EyeShow24Regular,
  MoreHorizontal24Regular,
  Save24Regular,
} from '@fluentui/react-icons';
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
import { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Button, IconButton } from '../../../components/Button';
import {
  Checkbox,
  DateTime,
  Number,
  ReferenceMany,
  SelectMany,
  SelectOne,
  Text,
} from '../../../components/ContentField';
import { Field } from '../../../components/ContentField/Field';
import { Menu } from '../../../components/Menu';
import { PageHead } from '../../../components/PageHead';
import { Tiptap } from '../../../components/Tiptap';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import { useDropdown } from '../../../hooks/useDropdown';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setField } from '../../../redux/slices/cmsItemSlice';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType, themeType } from '../../../utils/theme/theme';
import { Iaction } from '../ItemDetailsPage/ItemDetailsPage';
import { Sidebar } from './Sidebar';
import { useFindDoc } from './useFindDoc';

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
  let { collection, item_id } = useParams() as { collection: string; item_id: string };
  const [{ schemaDef, nameField, canPublish: isPublishable, options: collectionOptions }] =
    useCollectionSchemaConfig(collection);
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
  const { canPublish, publishLocked } = useMemo<{
    /**
     * Whether the current user has permission to publish this document.
     */
    canPublish: boolean;
    /**
     * The last stage in the stage field options, which is considered the stage
     * for documents that are published.
     */
    lastStage: number | undefined;
    /**
     * The current stage of the current document.
     */
    currentStage: number | undefined;
    /**
     * Lock the document to read-only mode because it is currently published
     * and the current user does not have permission to edit publish documents.
     */
    publishLocked: boolean;
  }>(() => {
    const canPublish = actionAccess?.publish === true;
    const cannotPublish = actionAccess?.publish !== true;

    const stageSchemaDef = schemaDef.find(([key]) => key === 'stage')?.[1];
    const stageFieldOptions = stageSchemaDef?.field?.options;
    const stageFieldOptionsAscendingOrder = stageFieldOptions?.sort((a, b) => {
      if (a.value.toString() > b.value.toString()) return 1;
      return -1;
    });

    const lastStage = parseFloat(stageFieldOptionsAscendingOrder?.[0]?.value?.toString() || '0') || undefined;
    const currentStage = parseFloat(getProperty(itemState.fields, 'stage')?.toString() || '0') || undefined;

    // if true, lock the publishing capability because the current user does not have permission
    const publishLocked = isPublishable && cannotPublish && currentStage === lastStage;

    return { canPublish, lastStage, currentStage, publishLocked };
  }, [actionAccess?.publish, isPublishable, itemState.fields, schemaDef]);

  // fs search param
  const fs = new URLSearchParams(search).get('fs');

  // calculate user watching status
  const { isWatching, isMandatoryWatcher, mandatoryWatchersKeys } = useMemo<{
    isWatching?: boolean;
    isMandatoryWatcher?: boolean;
    mandatoryWatchersKeys: string;
  }>(() => {
    const watchers: string[] = (
      (getProperty(itemState.fields, 'people.watching') as { _id: string }[]) || []
    ).map(({ _id }) => _id);

    const mandatoryWatchersKeys: string[] = collectionOptions?.mandatoryWatchers || [];
    const mandatoryWatchers = ([] as { _id: string }[]).concat
      .apply(
        [],
        mandatoryWatchersKeys?.map((key): { _id: string }[] => getProperty(itemState.fields, key) || [])
      )
      .map(({ _id }) => _id);

    const isWatching: boolean | undefined = authUserState && watchers?.includes(authUserState._id);
    const isMandatoryWatcher: boolean | undefined =
      authUserState && mandatoryWatchers?.includes(authUserState._id);

    return { isWatching, isMandatoryWatcher, mandatoryWatchersKeys: mandatoryWatchersKeys.join(', ') };
  }, [authUserState, collectionOptions?.mandatoryWatchers, itemState.fields]);

  // determine the actions for this document
  const actions: Array<Iaction | null> = useMemo(
    () => [
      {
        label: 'Discard changes & refresh',
        type: 'icon',
        icon: <ArrowClockwise24Regular />,
        action: () => refetch(),
      },
      {
        label: isWatching || isMandatoryWatcher ? 'Stop Watching' : 'Watch',
        type: 'button',
        icon: isWatching || isMandatoryWatcher ? <EyeHide24Regular /> : <EyeShow24Regular />,
        action: () => null,
        disabled: isMandatoryWatcher || actionAccess?.watch !== true,
        'data-tip': isMandatoryWatcher
          ? `You cannot stop watching this document because you are in one of the following groups: ${mandatoryWatchersKeys}`
          : undefined,
      },
      {
        label: 'Delete',
        type: 'button',
        icon: <Delete24Regular />,
        action: () => null,
        color: 'red',
        disabled: actionAccess?.hide !== true,
      },
      {
        label: 'Save',
        type: 'button',
        icon: <Save24Regular />,
        action: () => null,
        disabled: !itemState.isUnsaved || actionAccess?.modify !== true,
        'data-tip':
          actionAccess?.modify !== true
            ? `You cannot save this document because you do not have permission.`
            : !itemState.isUnsaved
            ? `There are no changes to save.`
            : undefined,
      },
      {
        label: 'Publish',
        type: 'button',
        icon: <CloudArrowUp24Regular />,
        action: () => null,
        disabled: canPublish !== true,
        'data-tip':
          canPublish !== true
            ? `You cannot publish this document because you do not have permission.`
            : undefined,
      },
    ],
    [
      actionAccess?.hide,
      actionAccess?.modify,
      actionAccess?.watch,
      canPublish,
      isMandatoryWatcher,
      isWatching,
      itemState.isUnsaved,
      mandatoryWatchersKeys,
      refetch,
    ]
  );

  const [showActionDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.top + triggerRect.height,
            left: triggerRect.right - 240,
            width: 240,
          }}
          items={
            actions
              .filter((action): action is Iaction => !!action)
              .filter((action) => action.label !== 'Save' && action.label !== 'Publish')
              .map((action) => {
                return {
                  onClick: () => action.action(),
                  label: action.label,
                  color: action?.color || 'primary',
                  disabled: action.disabled,
                  icon: action.icon,
                  'data-tip': action['data-tip'],
                };
              }) || []
          }
        />
      );
    },
    [actions],
    true,
    true
  );

  if (schemaDef) {
    return (
      <>
        {props.isEmbedded ? null : (
          <PageHead
            title={title.replace(' - Cristata', '')}
            buttons={
              <>
                {[
                  actions.find((action) => action?.label === 'Save'),
                  actions.find((action) => action?.label === 'Publish'),
                ]
                  .filter((action): action is Iaction => !!action)
                  .map((action, index) => {
                    return (
                      <span data-tip={action['data-tip']}>
                        <Button
                          key={index}
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
                  .map(([key, def]) => {
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
                            label={fieldName}
                            description={def.field?.description}
                            values={values}
                            disabled={loading || !!error}
                            isEmbedded={props.isEmbedded}
                            collection={pluralize.singular(collection)}
                            fields={def.field?.reference?.fields}
                            onChange={(newValues) => {
                              if (newValues !== undefined && !readOnly) dispatch(setField(newValues, key));
                            }}
                          />
                        );
                      }

                      // const value =
                      //   getProperty(itemState.fields, key)?._id && getProperty(itemState.fields, key)?.label
                      //     ? (getProperty(itemState.fields, key) as { _id: string; label: string })
                      //     : getProperty(itemState.fields, key)?._id ||
                      //       typeof getProperty(itemState.fields, key) === 'string'
                      //     ? { _id: getProperty(itemState.fields, key) }
                      //     : undefined;

                      return (
                        <Field
                          label={fieldName}
                          description={def.field?.description}
                          isEmbedded={props.isEmbedded}
                        >
                          <>
                            {def.type}
                            <code>{JSON.stringify(getProperty(itemState.fields, key))}</code>
                          </>
                        </Field>
                      );
                    }

                    // plain text fields
                    if (type === 'String') {
                      if (def.field?.options) {
                        const currentPropertyValue = getProperty(itemState.fields, key);
                        const options = def.field.options as NumberOption[];
                        return (
                          <SelectOne
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
