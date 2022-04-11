/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { colorType, themeType } from '../../../utils/theme/theme';
import { PageHead } from '../../../components/PageHead';
import { Button, IconButton } from '../../../components/Button';
import {
  ArrowClockwise24Regular,
  CloudArrowUp24Regular,
  Delete24Regular,
  EyeHide24Regular,
  EyeShow24Regular,
  Save24Regular,
} from '@fluentui/react-icons';
import { Label } from '../../../components/Label';
import { TextInput } from '../../../components/TextInput';
import { InputGroup } from '../../../components/InputGroup';
import { collections as collectionsConfig } from '../../../config';
import styled from '@emotion/styled/macro';
import { unflattenObject } from '../../../utils/unflattenObject';
import { toast } from 'react-toastify';
import { Tiptap } from '../../../components/Tiptap';
import ColorHash from 'color-hash';
import { MultiSelect, Select } from '../../../components/Select';
import { DateTime } from '../../../components/DateTime';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../../components/Modal';
import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Color from 'color';
import { ErrorBoundary } from 'react-error-boundary';
import { genAvatar } from '../../../utils/genAvatar';
import { setFields, setField, setIsLoading, CmsItemState } from '../../../redux/slices/cmsItemSlice';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import ReactTooltip from 'react-tooltip';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import {
  ApolloClient,
  ApolloError,
  gql,
  NetworkStatus,
  NormalizedCacheObject,
  useMutation,
  useQuery,
} from '@apollo/client';
import { merge } from 'merge-anything';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { buildFullKey } from '../../../utils/buildFullKey';
import { isJSON } from '../../../utils/isJSON';
import { client } from '../../../graphql/client';
import { isObject } from '../../../utils/isObject';
import { IField } from '../../../config/collections';
import { FullScreenSplash } from './FullScreenSplash';
import { get as getProperty, set as setProperty } from 'object-path';

const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5 });

const PageWrapper = styled.div<{ theme?: themeType; isEmbedded?: boolean }>`
  padding: ${({ isEmbedded }) => (isEmbedded ? 0 : 20)}px;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
  overflow: auto;
`;

interface Iaction {
  label: string;
  type: 'icon' | 'button';
  icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  action: () => void;
  color?: colorType;
  disabled?: boolean;
  'data-tip'?: string;
}

interface IItemDetailsPage {
  isEmbedded?: boolean; // controls whether header, padding, tiptap, etc are hidden
}

function ItemDetailsPage(props: IItemDetailsPage) {
  const state = useAppSelector((state) => state.cmsItem);
  const authUserState = useAppSelector((state) => state.authUser);
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // get the url parameters from the route
  let { collection, item_id } = useParams();

  const collectionConfig = collectionsConfig[dashToCamelCase(collection || '')];

  const requiredFields = [
    '_id',
    'hidden',
    'locked',
    'history.type',
    'history.user.name',
    'history.at',
    'timestamps.modified_at',
    'timestamps.created_at',
  ];
  const publishableRequiredFields = ['timestamps.updated_at', 'timestamps.published_at'];

  const GENERATED_ITEM_QUERY = collectionConfig
    ? gql(
        jsonToGraphQLQuery(
          {
            query: {
              [collectionConfig.query.name.singular]: {
                __args: {
                  [collectionConfig.query.identifier]: item_id,
                },
                ...unflattenObject(
                  merge(
                    {},
                    ...(collectionConfig?.query.name.singular !== 'setting'
                      ? requiredFields.map((field) => ({ [field]: true }))
                      : []),
                    ...(collectionConfig?.isPublishable
                      ? publishableRequiredFields.map((field) => ({ [field]: true }))
                      : []),
                    collectionConfig?.canWatch ? { 'people.watching._id': true } : {},
                    ...(collectionConfig?.query.force?.map((field) => ({ [field]: true })) || []),
                    ...(collectionConfig?.mandatoryWatchers?.map((field) => ({ [field]: true })) || []),
                    ...collectionConfig?.fields.map((field) => ({
                      [field.from ? field.from : field.subfield ? field.key + '.' + field.subfield : field.key]:
                        true,
                    }))
                  )
                ),
              },
            },
          },
          { pretty: true }
        )
      )
    : gql``;

  // get the item
  const { loading, error, refetch, networkStatus, ...req } = useQuery(GENERATED_ITEM_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  let data = collectionConfig ? req.data?.[collectionConfig.query.name.singular] : undefined;

  // if the query is loading or refetching, set `isLoading` in redux
  useEffect(() => {
    if (loading || networkStatus === NetworkStatus.refetch) {
      dispatch(setIsLoading(true));
    } else {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, loading, networkStatus]);

  // save the item to redux
  useEffect(() => {
    if (data) dispatch(setFields(data));
  }, [data, dispatch]);

  // set document title
  const title = `${state.isUnsaved ? '*' : ''}${
    collectionConfig?.itemPageTitle
      ? collectionConfig.itemPageTitle(state.fields)
      : getProperty(state.fields, 'name') || item_id
  } - Cristata`;
  useEffect(() => {
    document.title = title;
  }, [collectionConfig, data, item_id, state.fields, state.fields.name, state.isUnsaved, title]);

  //
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const value = e.currentTarget.value;
    dispatch(setField(value, key));
  };

  /**
   *
   * @param value
   * @param key
   * @param type the type stored in the flat data
   */
  const handleSelectChange = (value: string | number, key: string, type: string) => {
    value = type === 'number' ? parseFloat(value as string) : value;
    dispatch(setField(value, key));
  };

  /**
   * Sets the updated multiselect values in the data.
   * Values may be strings or numbers (integers).
   */
  const handleMultiselectChange = (value: string[] | number[], key: string, type: string) => {
    if (type === 'number') value = value.map((val: string | number) => parseInt(`${val}`));
    if (type === 'string') value = value.map((val: string | number) => val.toString());
    dispatch(setField(value, key));
  };

  /**
   * Sets the updated ISO datetime string in the data
   */
  const handleDateTimeChange = (value: string, key: string) => {
    dispatch(setField(value, key));
  };

  /**
   * Sets an updated boolean value in the data
   */
  const handleBooleanChange = (value: boolean, key: string) => {
    dispatch(setField(value, key));
  };

  // save changes to the databse
  const saveChanges = async (extraData: { [key: string]: any } = {}) => {
    if (collection && item_id) {
      setIsLoading(true);

      // create the mutation
      const MODIFY_ITEM = (id: string, input: Record<string, unknown> | string) => {
        const colName = collectionConfig?.query.name.singular;
        const identifier = collectionConfig?.query.identifier || '_id';
        if (colName === 'setting') input = JSON.stringify(input);
        return gql(
          jsonToGraphQLQuery({
            mutation: {
              [`${colName}Modify`]: {
                __args: {
                  [identifier]: id,
                  input: input,
                },
                _id: true,
              },
            },
          })
        );
      };

      // modify the item in the database
      const config = {
        mutation: MODIFY_ITEM(item_id, { ...state.unsavedFields, ...state.tipTapFields, ...extraData }),
      };
      return await client
        .mutate(config)
        .finally(() => {
          setIsLoading(false);
        })
        .then(() => {
          toast.success(`Changes successfully saved.`);
          refetch();
          return true;
        })
        .catch((error: ApolloError) => {
          console.error(error);
          const message = error.clientErrors?.[0]?.message || error.message;
          toast.error(`Failed to save changes. \n ${message}`);
          return false;
        });
    } else {
      toast.error(`Cannot save changes because the collection and document ID is unknown.`);
    }
  };

  // set the item to hidden
  const HIDE_ITEM = gql`mutation {
    ${collectionConfig?.query.name.singular}Hide(${collectionConfig?.query.identifier || '_id'}: "${item_id}") {
      hidden
    }
  }`;
  const [hideItemMutation] = useMutation(HIDE_ITEM);

  /**
   * Set the item to be hidden.
   */
  const hideItem = () => {
    setIsLoading(true);
    hideItemMutation()
      .then(() => {
        setIsLoading(false);
        toast.success(`Item successfully hidden.`);
        navigate(collectionConfig?.home || '/');
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to hide item. \n ${err.message}`);
      });
  };

  // watch the item
  const WATCH_ITEM = gql`mutation {
    ${collectionConfig?.query.name.singular}Watch(${
    collectionConfig?.query.identifier || '_id'
  }: "${item_id}") {
      people {
        watching {
          _id
        }
      }
    }
  }`;
  const UNWATCH_ITEM = gql`mutation {
    ${collectionConfig?.query.name.singular}Watch(${
    collectionConfig?.query.identifier || '_id'
  }: "${item_id}", watch: false) {
      people {
        watching {
          _id
        }
      }
    }
  }`;
  const [watchItemMutation] = useMutation(WATCH_ITEM);
  const [unwatchItemMutation] = useMutation(UNWATCH_ITEM);

  /**
   * Toggle whether the current user is watching this item
   */
  const watchItem = (mode: boolean) => {
    setIsLoading(true);
    (mode ? watchItemMutation() : unwatchItemMutation())
      .then(() => {
        setIsLoading(false);
        if (mode) {
          toast.success(`You are now watching this item.`);
        } else {
          toast.success(`You are no longer watching this item.`);
        }
        setIsWatching(mode);
        refetch();
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to watch item. \n ${err.message}`);
      });
  };

  // store whether user is watching the item
  const [isWatching, setIsWatching] = useState<boolean>();
  useEffect(() => {
    if (
      authUserState &&
      data?.people?.watching &&
      JSON.stringify(data.people.watching).includes(authUserState._id)
    )
      // stringify it since it can be either a profile id or a profile object
      setIsWatching(true);
    else setIsWatching(false);
  }, [authUserState, data]);

  // store whether the user is a mandatory watcher
  const [isMadatoryWatcher, setIsMandatoryWatcher] = useState<boolean>();
  useEffect(() => {
    // get the mandatory watchers
    const mandatoryWatchersKeys = collectionConfig?.mandatoryWatchers;
    const mandatoryWatchers = mandatoryWatchersKeys
      ?.map((key) => JSON.stringify(getProperty(state.fields, key)))
      .filter((watcher) => watcher !== undefined); // stringify it since it can be either a profile id or a profile object

    // set if current user is a mandatory watcher by checking if the user is inside `mandatoryWatchers`
    if (authUserState && mandatoryWatchers && JSON.stringify(mandatoryWatchers).includes(authUserState._id))
      setIsMandatoryWatcher(true);
    else setIsMandatoryWatcher(false);
  }, [collection, authUserState, state.fields, collectionConfig?.mandatoryWatchers]);

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // determine whether the user can publish the item
  const { data: permissionsData, loading: loadingPermissions } = useQuery(
    collectionConfig
      ? gql(
          jsonToGraphQLQuery({
            query: {
              [collectionConfig.query.name.singular + 'ActionAccess']: {
                modify: true,
                hide: true,
                lock: true,
                watch: true,
                publish: true,
              },
            },
          })
        )
      : gql``
  );
  const permissions: Record<string, boolean> | undefined =
    permissionsData?.[collectionConfig!.query.name.singular + 'ActionAccess'];

  // calculate publish permissions
  const cannotPublish = permissions?.publish !== true;
  const publishStage: number | undefined = collectionConfig?.publishStage;
  const isPublishable = collectionConfig?.isPublishable; // true only if set in config
  const publishLocked =
    cannotPublish !== false && getProperty(state.fields, 'stage') === publishStage && isPublishable === true; // if true, lock the publishing capability

  // publish confirmation modal
  const [showPublishModal, hidePublishModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [confirm, setConfirm] = useState<string>('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [timestamp, setTimestamp] = useState<string>(
      getProperty(state.fields, 'timestamps.published_at') as string
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const PUBLISH_ITEM = gql`mutation {
      ${collectionConfig?.query.name.singular}Publish(${
      collectionConfig?.query.identifier || '_id'
    }: "${item_id}", published_at: "${timestamp || new Date().toISOString()}", publish: true) {
        timestamps {
          published_at
        }
      }
    }`;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [publishItem] = useMutation(PUBLISH_ITEM);

    return (
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <PlainModal
          hideModal={hidePublishModal}
          title={`Publish article`}
          continueButton={{
            text: 'Publish',
            onClick: async () => {
              setIsLoading(true);
              const publishStage: number | undefined = collectionConfig?.publishStage;
              if (publishStage) {
                const isPublished = !!(await publishItem()).data;
                const isStageSet = await saveChanges({
                  stage: publishStage,
                });
                // return whether the action was successful
                setIsLoading(false);
                if (isStageSet === true && isPublished === true) return true;
              }
              return false;
            },
            disabled: confirm !== 'confirm',
          }}
          isLoading={isLoading}
        >
          <p style={{ marginTop: 0 }}>
            Before continuing, please <b>check the article and its metadata for formatting issues and typos</b>.
          </p>
          <p>
            Once you publish this article, it will be available for everyone to see. Only a few members of The
            Paladin's Board will be able to unpublish this article.
          </p>
          <InputGroup type={`text`}>
            <Label
              htmlFor={'date'}
              description={
                'This data can be any time in the past or future. Content will not appear until the date has occured.'
              }
            >
              Choose publish date and time
            </Label>
            <DateTime
              value={timestamp === '0001-01-01T01:00:00.000Z' ? null : timestamp}
              onChange={(date) => {
                if (date) setTimestamp(date.toUTC().toISO());
              }}
              placeholder={'Pick a time'}
            />
          </InputGroup>
          <InputGroup type={'text'}>
            <Label htmlFor={'confirm'}>Confirm publish</Label>
            <TextInput
              name={'confirm'}
              id={'confirm'}
              title={'confirm'}
              placeholder={`Type "confirm" to publish the article`}
              value={confirm}
              onChange={(e) => setConfirm(e.currentTarget.value)}
            />
          </InputGroup>
        </PlainModal>
      </MuiPickersUtilsProvider>
    );
  }, [state.fields]);

  const actions: Array<Iaction | null> = [
    {
      label: 'Refresh',
      type: 'icon',
      icon: <ArrowClockwise24Regular />,
      action: () => refetch(),
    },
    collectionConfig?.canWatch
      ? {
          label: isWatching || isMadatoryWatcher ? 'Stop Watching' : 'Watch',
          type: 'button',
          icon: isWatching || isMadatoryWatcher ? <EyeHide24Regular /> : <EyeShow24Regular />,
          disabled: isMadatoryWatcher || permissions?.watch !== true,
          action: () => watchItem(!isWatching),
        }
      : null,
    {
      label: 'Delete',
      type: 'button',
      icon: <Delete24Regular />,
      action: hideItem,
      color: 'red',
      disabled: permissions?.hide !== true,
    },
    {
      label: 'Save',
      type: 'button',
      icon: <Save24Regular />,
      action: () => saveChanges(),
      disabled: !state.isUnsaved || permissions?.modify !== true,
    },
    collectionConfig?.isPublishable
      ? //only allow publishing if canPublish is true
        {
          label: 'Publish',
          type: 'button',
          icon: <CloudArrowUp24Regular />,
          action: showPublishModal,
          disabled: cannotPublish,
        }
      : null,
  ];

  // variable with the fs search param
  const fs = new URLSearchParams(search).get('fs');

  // content to only show in fulscreen, unembedded mode once all data has loaded
  const fsWait = !(!props.isEmbedded && fs === 'force' && state.isLoading && !data);

  /**
   * Process values for selects
   */
  type multiselectValType = string | number | Record<string, unknown>;
  const processValue = (val: multiselectValType, field: IField) => {
    // if the value should be a subfield of an object and the provided value is an object,
    // change the value to the subfield value
    if (field.subfield && isObject(val)) val = val[field.subfield] as string | number;
    // if the field has a `modifyValue` function, execute it now
    if (field.modifyValue) val = field.modifyValue(val, state.fields, client);
    // ensure that values are strings
    return val?.toString() || '';
  };

  return (
    <>
      {props.isEmbedded || !fsWait ? null : (
        <PageHead
          title={
            collectionConfig && collectionConfig.itemPageTitle
              ? collectionConfig.itemPageTitle(state.fields)
              : data && data.name
              ? data.name
              : item_id
          }
          description={`${
            collection
              ? collection.slice(0, 1).toLocaleUpperCase() + collection.slice(1).replace('-', ' ')
              : 'Unknown'
          } collection ${state.isUnsaved ? ' | Unsaved changes' : ''}`}
          buttons={
            <>
              {actions.map((action, index) => {
                if (action === null) {
                  return null;
                }
                if (action.type === 'icon' && action.icon) {
                  return (
                    <IconButton
                      key={index}
                      onClick={action.action}
                      icon={action.icon}
                      color={action.color}
                      disabled={action.disabled}
                      data-tip={action.label}
                    />
                  );
                }
                if (action.type === 'button') {
                  return (
                    <Button key={index} onClick={action.action} color={action.color} disabled={action.disabled}>
                      {action.label}
                    </Button>
                  );
                }
                return null;
              })}
            </>
          }
          isLoading={state.isLoading}
        />
      )}

      {!props.isEmbedded && fs === 'force' ? <FullScreenSplash isLoading={state.isLoading} /> : null}
      <PageWrapper theme={theme} isEmbedded={props.isEmbedded}>
        {publishLocked && !props.isEmbedded && !fs ? (
          <Notice theme={theme}>
            This document is opened in read-only mode because it has been published and you do not have publish
            permissions.
          </Notice>
        ) : null}
        {(state.isLoading && !data) || (isPublishable ? loadingPermissions : false) ? (
          // loading
          'Loading...'
        ) : //error
        error || getProperty(state.fields, 'hidden') ? (
          <div>
            Error loading.
            <pre>
              <code>{JSON.stringify(error, null, 2)}</code>
            </pre>
          </div>
        ) : // waiting for user info
        sessionId === null ? null : (
          // data loaded
          collectionConfig?.fields.map((field, index) => {
            // if a field is from a JSON object, unstringify the JSON in the source data
            if (field.from) {
              // check if it is JSON since it may have alreadt been converted
              if (isJSON(getProperty(state.fields, field.from))) {
                const parsed = JSON.parse(getProperty(state.fields, field.from));
                const copy = { ...data };
                setProperty(copy, field.from, parsed);
                dispatch(setFields(copy));
              }
            }

            if (field.type === 'text' && (props.isEmbedded || !fs || fs === '0')) {
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <TextInput
                      name={field.label}
                      id={buildFullKey(field.key, field.from, undefined)}
                      value={
                        field.modifyValue
                          ? field.modifyValue(
                              getProperty(
                                state.fields,
                                buildFullKey(field.key, field.from, undefined)
                              ) as string,
                              state.fields,
                              client
                            )
                          : (getProperty(
                              state.fields,
                              buildFullKey(field.key, field.from, undefined)
                            ) as string) || ''
                      }
                      onChange={(e) => handleTextChange(e, buildFullKey(field.key, field.from, undefined))}
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'boolean' && (props.isEmbedded || !fs || fs === '0')) {
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`checkbox`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <input
                      type={'checkbox'}
                      name={field.label}
                      id={buildFullKey(field.key, field.from, undefined)}
                      checked={!!getProperty(state.fields, buildFullKey(field.key, field.from, undefined))}
                      onChange={(e) =>
                        handleBooleanChange(
                          e.currentTarget.checked,
                          buildFullKey(field.key, field.from, undefined)
                        )
                      }
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'tiptap') {
              if (props.isEmbedded) {
                return null;
              }
              const isHTML =
                field.tiptap && field.tiptap.isHTMLkey && getProperty(state.fields, field.tiptap.isHTMLkey);
              const html = isHTML
                ? (getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) as string)
                : undefined;
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <div
                      id={buildFullKey(field.key, field.from, undefined)}
                      css={css`
                        width: 100%;
                        box-sizing: border-box;
                        border-radius: ${theme.radius};
                        border: none;
                        box-shadow: ${theme.color.neutral[theme.mode][800]} 0px 0px 0px 1px inset;
                        transition: box-shadow 240ms;
                        padding: 2px;
                        height: 400px;
                        overflow: auto;
                        &:hover {
                          box-shadow: ${theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
                        }
                        &:focus-within {
                          outline: none;
                          box-shadow: ${theme.color.primary[800]} 0px 0px 0px 2px inset;
                        }
                        .ProseMirror {
                          &:focus {
                            outline: none;
                          }
                        }
                      `}
                    >
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
                        options={field.tiptap}
                        isDisabled={state.isLoading || publishLocked ? true : isHTML ? true : field.isDisabled}
                        showLoading={state.isLoading}
                        sessionId={sessionId}
                        html={html}
                        isMaximized={fs === '1' || fs === 'force'}
                        forceMax={fs === 'force'}
                        onDebouncedChange={(editorJson, storedJson) => {
                          const isDefaultJson = editorJson === `[{"type":"paragraph","attrs":{"class":null}}]`;
                          if (!isDefaultJson && storedJson !== null && editorJson !== storedJson) {
                            dispatch(
                              setField(editorJson, buildFullKey(field.key, field.from, undefined), 'tiptap')
                            );
                          }
                        }}
                        currentJsonInState={
                          JSON.stringify(state.fields) === '{}'
                            ? null
                            : getProperty(state.fields, buildFullKey(field.key, field.from, undefined))
                        }
                        actions={actions}
                        layout={getProperty(state.fields, 'layout')}
                        message={
                          publishLocked
                            ? 'This document is opened in read-only mode because it has been published and you do not have publish permissions.'
                            : undefined
                        }
                      />
                    </div>
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'select' && (props.isEmbedded || !fs || fs === '0')) {
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <Select
                      options={field.options?.map((option) => {
                        if (typeof option.isDisabled === 'function') {
                          return {
                            ...option,
                            isDisabled: option.isDisabled([
                              `${
                                getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) as
                                  | string
                                  | number
                              }`,
                            ]),
                          };
                        }
                        return option;
                      })}
                      client={client}
                      val={
                        field.modifyValue
                          ? field.modifyValue(
                              `${
                                getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) as
                                  | string
                                  | number
                              }`,
                              state.fields,
                              client
                            )
                          : `${
                              getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) as
                                | string
                                | number
                            }`
                      }
                      onChange={(valueObj) =>
                        handleSelectChange(
                          valueObj ? valueObj.value : '',
                          buildFullKey(field.key, field.from, undefined),
                          typeof getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) ===
                            'number'
                            ? 'number'
                            : 'string'
                        )
                      }
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'select_async' && (props.isEmbedded || !fs || fs === '0')) {
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <Select
                      loadOptions={field.async_options}
                      async
                      client={client}
                      val={
                        field.modifyValue
                          ? field.modifyValue(
                              `${
                                getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) as
                                  | string
                                  | number
                              }`,
                              state.fields,
                              client
                            )
                          : `${
                              getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) as
                                | string
                                | number
                            }`
                      }
                      onChange={(valueObj) =>
                        handleSelectChange(
                          valueObj ? valueObj.value : '',
                          buildFullKey(field.key, field.from, undefined),
                          typeof getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) ===
                            'number'
                            ? 'number'
                            : 'string'
                        )
                      }
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'multiselect' && (props.isEmbedded || !fs || fs === '0')) {
              const vals = (
                getProperty(
                  state.fields,
                  buildFullKey(field.key, field.from, undefined)
                ) as multiselectValType[]
              )?.map((val) => processValue(val, field));
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <MultiSelect
                      options={field.options?.map((option) => {
                        if (typeof option.isDisabled === 'function') {
                          return {
                            ...option,
                            isDisabled: option.isDisabled(vals || []),
                          };
                        }
                        return option;
                      })}
                      val={vals}
                      onChange={(valueObjs) =>
                        handleMultiselectChange(
                          valueObjs ? valueObjs.map((obj: { value: string; number: string }) => obj.value) : '',
                          buildFullKey(field.key, field.from, undefined),
                          field.dataType || 'string'
                        )
                      }
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'multiselect_async' && (props.isEmbedded || !fs || fs === '0')) {
              const vals = (
                getProperty(
                  state.fields,
                  buildFullKey(field.key, field.from, undefined)
                ) as multiselectValType[]
              )?.map((val) => processValue(val, field));
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <MultiSelect
                      loadOptions={field.async_options}
                      async
                      val={vals}
                      onChange={(valueObjs) => {
                        handleMultiselectChange(
                          valueObjs ? valueObjs.map((obj: { value: string; label: string }) => obj.value) : '',
                          buildFullKey(field.key, field.from, undefined),
                          field.dataType || 'string'
                        );
                      }}
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'multiselect_creatable' && (props.isEmbedded || !fs || fs === '0')) {
              const val = (
                getProperty(
                  state.fields,
                  buildFullKey(field.key, field.from, undefined)
                ) as multiselectValType[]
              )?.map((val) => processValue(val, field));
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <MultiSelect
                      options={field.options?.map((option) => {
                        if (typeof option.isDisabled === 'function') {
                          return {
                            ...option,
                            isDisabled: option.isDisabled(val || []),
                          };
                        }
                        return option;
                      })}
                      val={val}
                      onChange={(valueObjs) =>
                        handleMultiselectChange(
                          valueObjs ? valueObjs.map((obj: { value: string; number: string }) => obj.value) : '',
                          buildFullKey(field.key, field.from, undefined),
                          field.dataType || 'string'
                        )
                      }
                      isCreatable
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'datetime' && (props.isEmbedded || !fs || fs === '0')) {
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <DateTime
                      value={
                        getProperty(state.fields, buildFullKey(field.key, field.from, undefined)) ===
                        '0001-01-01T01:00:00.000Z'
                          ? null
                          : field.modifyValue
                          ? field.modifyValue(
                              getProperty(
                                state.fields,
                                buildFullKey(field.key, field.from, undefined)
                              ) as string,
                              state.fields,
                              client
                            )
                          : (getProperty(
                              state.fields,
                              buildFullKey(field.key, field.from, undefined)
                            ) as string)
                      }
                      onChange={(date) => {
                        if (date)
                          handleDateTimeChange(
                            date.toUTC().toISO(),
                            buildFullKey(field.key, field.from, undefined)
                          );
                      }}
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (
              field.type === 'custom' &&
              field.Component &&
              JSON.stringify(state.fields) !== '{}' &&
              (props.isEmbedded || !fs || fs === '0')
            ) {
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <field.Component
                    state={state}
                    dispatch={dispatch}
                    setStateFunctions={{ setFields, setField, setIsLoading }}
                    theme={theme}
                    search={search}
                    actions={actions}
                    client={client}
                  />
                </ErrorBoundary>
              );
            }

            if (props.isEmbedded || !fs || fs === '0') {
              return (
                <ErrorBoundary
                  key={index}
                  fallback={<div>Error loading field '{buildFullKey(field.key, field.from, undefined)}'</div>}
                >
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={buildFullKey(field.key, field.from, undefined)}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <pre>{JSON.stringify(field)}</pre>
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            return null;
          })
        )}
        {
          // show button to exit fullscreen mode to show all fields
          // in case fullscreen mode is enabled, but an error has caused
          // it to not actually be fullscreen (fullscreen mode tiptap
          // always includes an embedded version of this component)
          !props.isEmbedded && (fs === '1' || fs === 'force') ? (
            <Button
              onClick={() => {
                const params = new URLSearchParams(search);
                params.set('fs', '0');
                navigate(pathname + '?' + params.toString() + hash, { replace: true });
              }}
            >
              Show more fields
            </Button>
          ) : null
        }
      </PageWrapper>
    </>
  );
}

const Notice = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  background-color: ${({ theme }) =>
    theme.mode === 'light' ? Color(theme.color.orange[800]).lighten(0.64).hex() : theme.color.orange[1400]};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  padding: 10px 20px;
  position: sticky;
  top: -20px;
  margin: -20px 0 20px -20px;
  width: 100%;
  z-index: 99;
`;

interface CustomFieldProps {
  state: CmsItemState;
  dispatch: Dispatch<AnyAction>;
  setStateFunctions: {
    setFields: typeof setFields;
    setField: typeof setField;
    setIsLoading: typeof setIsLoading;
  };
  theme: themeType;
  search: string;
  actions: (Iaction | null)[];
  client: ApolloClient<NormalizedCacheObject>;
}

export { ItemDetailsPage };
export type { Iaction, CustomFieldProps };
