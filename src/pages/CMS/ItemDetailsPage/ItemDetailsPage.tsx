/** @jsxImportSource @emotion/react */
import {
  ApolloClient,
  ApolloError,
  gql,
  NetworkStatus,
  NormalizedCacheObject,
  useMutation,
  useQuery,
} from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { ArrowClockwise24Regular, Delete24Regular, Save24Regular } from '@fluentui/react-icons';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import { get as getProperty, set as setProperty } from 'object-path';
import pluralize from 'pluralize';
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { Button, IconButton } from '../../../components/Button';
import { DateTime } from '../../../components/DateTime';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { PageHead } from '../../../components/PageHead';
import { MultiSelect, Select } from '../../../components/Select';
import { TextInput } from '../../../components/TextInput';
import { collections as collectionsConfig } from '../../../config';
import { IField } from '../../../config/collections';
import { client } from '../../../graphql/client';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { CmsItemState, setField, setFields, setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { buildFullKey } from '../../../utils/buildFullKey';
import { capitalize } from '../../../utils/capitalize';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { isJSON } from '../../../utils/isJSON';
import { isObject } from '../../../utils/isObject';
import { colorType, themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';
import { unflattenObject } from '../../../utils/unflattenObject';
import { FullScreenSplash } from './FullScreenSplash';

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
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection || '')));

  const collectionConfig = collectionsConfig[collectionName];

  const [{ by }] = useCollectionSchemaConfig(collectionName);

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

  const GENERATED_ITEM_QUERY = collectionConfig
    ? gql(
        jsonToGraphQLQuery(
          {
            query: {
              [uncapitalize(collectionName)]: {
                __args: {
                  [by?.one || '_id']: item_id,
                },
                ...unflattenObject(
                  merge(
                    {},
                    ...(uncapitalize(collectionName) !== 'setting'
                      ? requiredFields.map((field) => ({ [field]: true }))
                      : []),
                    ...(collectionConfig?.forceFields?.map((field) => ({ [field]: true })) || []),
                    ...(collectionConfig?.fields?.map((field) => ({
                      [field.from ? field.from : field.subfield ? field.key + '.' + field.subfield : field.key]:
                        true,
                    })) || [])
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
  let data = collectionConfig ? req.data?.[uncapitalize(collectionName)] : undefined;

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
        const colName = uncapitalize(collectionName);
        if (colName === 'setting') input = JSON.stringify(input);
        return gql(
          jsonToGraphQLQuery({
            mutation: {
              [`${colName}Modify`]: {
                __args: {
                  [by?.one || '_id']: id,
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
    ${uncapitalize(collectionName)}Hide(${by?.one || '_id'}: "${item_id}") {
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
        navigate('/');
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to hide item. \n ${err.message}`);
      });
  };

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // determine whether the user can publish the item
  const { data: permissionsData } = useQuery(
    collectionConfig
      ? gql(
          jsonToGraphQLQuery({
            query: {
              [uncapitalize(collectionName) + 'ActionAccess']: {
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
    permissionsData?.[uncapitalize(collectionName) + 'ActionAccess'];

  // calculate publish permissions

  const actions: Array<Iaction | null> = [
    {
      label: 'Refresh',
      type: 'icon',
      icon: <ArrowClockwise24Regular />,
      action: () => refetch(),
    },
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
        {state.isLoading && !data ? (
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
          collectionConfig?.fields?.map((field, index) => {
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
                      isDisabled={state.isLoading ? true : field.isDisabled}
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
                      disabled={state.isLoading ? true : field.isDisabled}
                    />
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
                      isDisabled={state.isLoading ? true : field.isDisabled}
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
                      isDisabled={state.isLoading ? true : field.isDisabled}
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
                      isDisabled={state.isLoading ? true : field.isDisabled}
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
                      isDisabled={state.isLoading ? true : field.isDisabled}
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
                      isDisabled={state.isLoading ? true : field.isDisabled}
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
                      isDisabled={state.isLoading ? true : field.isDisabled}
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
                      disabled={state.isLoading ? true : field.isDisabled}
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
