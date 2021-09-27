/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
import useAxios from 'axios-hooks';
import { Label } from '../../../components/Label';
import { TextInput } from '../../../components/TextInput';
import { flattenObject } from '../../../utils/flattenObject';
import { InputGroup } from '../../../components/InputGroup';
import { collections as collectionsConfig } from '../../../config';
import styled from '@emotion/styled';
import { db } from '../../../utils/axios/db';
import { unflattenObject } from '../../../utils/unflattenObject';
import { toast } from 'react-toastify';
import { Tiptap } from '../../../components/Tiptap';
import ColorHash from 'color-hash';
import { MultiSelect, Select } from '../../../components/Select';
import { DateTime } from '../../../components/DateTime';
import { IAuthUser } from '../../../interfaces/cristata/authuser';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../../components/Modal';
import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Color from 'color';
import { ErrorBoundary } from 'react-error-boundary';

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
}

interface IItemDetailsPage {
  flatData?: { [key: string]: string | string[] | number | number[] | boolean };
  setFlatData?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string | string[] | number | number[] | boolean;
    }>
  >;
  isEmbedded?: boolean; // controls whether header, padding, tiptap, etc are hidden
}

function ItemDetailsPage(props: IItemDetailsPage) {
  const theme = useTheme() as themeType;
  const history = useHistory();

  // get the url parameters from the route
  let { collection, item_id } = useParams<{
    collection: string;
    item_id: string;
  }>();

  // collection name in the database (fall back to collection from url)
  let collectionName: string = `${collection}`;
  if (collectionsConfig[dashToCamelCase(collection)]) {
    const collectionConfig = collectionsConfig[dashToCamelCase(collection)];
    if (collectionConfig && collectionConfig.collectionName) {
      collectionName = collectionConfig.collectionName;
    }
  }

  // get the item
  const [{ data, loading, error }, refetch] = useAxios(
    `/${collectionName}/${item_id}`
  );

  // store whether the page is loading/updating/saving
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // keep track of whether changes have been made that have not been saved
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // save a flattened version of the data in state for modification
  const [flatData, setFlatData] = useState<{
    [key: string]: string | string[] | number | number[] | boolean;
  }>(props.flatData ? props.flatData : {});
  useEffect(() => {
    // only if data has been fetched AND flatData was not provided as props
    if (data && !props.flatData) {
      setFlatData(flattenObject(data));
      setHasUnsavedChanges(false);
    }
  }, [data]);

  // if flatData was passed as props, keep flatData from props in sync with the source
  useEffect(() => {
    // source --> component
    if (props.flatData) {
      setFlatData(props.flatData);
    }
  }, [props.flatData]);
  useEffect(() => {
    // component --> source
    if (props.setFlatData) {
      props.setFlatData(flatData);
    }
  }, [flatData]);

  //
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    setFlatData({
      ...flatData,
      [key]: e.currentTarget.value,
    });
    setHasUnsavedChanges(true);
  };

  /**
   *
   * @param value
   * @param key
   * @param type the type stored in the flat data
   */
  const handleSelectChange = (
    value: string | number,
    key: string,
    type: string
  ) => {
    setFlatData({
      ...flatData,
      [key]: type === 'number' ? parseFloat(value as string) : value,
    });
    setHasUnsavedChanges(true);
  };

  /**
   * Sets the updated multiselect values in the data.
   * Values may be strings or numbers (integers).
   */
  const handleMultiselectChange = (
    value: string[] | number[],
    key: string,
    type: string
  ) => {
    if (type === 'number')
      value = value.map((val: string | number) => parseInt(`${val}`));
    if (type === 'string')
      value = value.map((val: string | number) => val.toString());
    setFlatData({
      ...flatData,
      [key]: value,
    });
    setHasUnsavedChanges(true);
  };

  /**
   * Sets the updated ISO datetime string in the data
   */
  const handleDateTimeChange = (value: string, key: string) => {
    setFlatData({
      ...flatData,
      [key]: value,
    });
    setHasUnsavedChanges(true);
  };

  /**
   * Sets an updated boolean value in the data
   */
  const handleBooleanChange = (value: boolean, key: string) => {
    setFlatData({
      ...flatData,
      [key]: value,
    });
    setHasUnsavedChanges(true);
  };

  // save changes to the databse
  const saveChanges = async (extraData: { [key: string]: any } = {}) => {
    setIsLoading(true);
    setFlatData({
      ...flatData,
      ...extraData,
    });
    return await db
      .patch(
        `/${collectionName}/${item_id}`,
        unflattenObject({ ...flatData, ...extraData })
      )
      .then(() => {
        setIsLoading(false);
        toast.success(`Changes successfully saved.`);
        refetch();
        setHasUnsavedChanges(false);
        return true;
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
        return false;
      });
  };

  // set the item to hidden
  const hideItem = () => {
    setIsLoading(true);
    db.patch(`/${collectionName}/${item_id}`, { ...data, hidden: true })
      .then(() => {
        setIsLoading(false);
        toast.success(`Item successfully hidden.`);
        history.push(
          collectionsConfig[dashToCamelCase(collection)]?.home || '/'
        );
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to hide item. \n ${err.message}`);
      });
  };

  // watch the item
  const watchItem = (mode: boolean) => {
    setIsLoading(true);
    db.patch(`/${collectionName}/${item_id}/watch`, { watch: mode })
      .then(() => {
        setIsLoading(false);
        if (mode) {
          toast.success(`You are now watching this item.`);
        } else {
          toast.success(`You are no longer watching this item.`);
        }
        setIsWatching(mode);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to watch item. \n ${err.message}`);
      });
  };

  // get the user data from localstorage
  const [user, setUser] = useState<IAuthUser>();
  useEffect(() => {
    const userJson = localStorage.getItem('auth.user');
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
  }, []);

  // store whether user is watching the item
  const [isWatching, setIsWatching] = useState<boolean>();
  useEffect(() => {
    if (user) {
      if (data?.people?.watching?.includes(parseInt(user.id))) {
        setIsWatching(true);
      } else {
        setIsWatching(false);
      }
    }
  }, [user, data]);

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // determine whether the user can publish the item
  const [{ data: permissions, loading: loadingPermissions }] = useAxios<{
    canPublish: boolean;
  }>(`/${collection}/permissions`);

  // calculate publish permissions
  const cannotPublish = permissions?.canPublish !== true;
  const publishStage: number | undefined =
    collectionsConfig[dashToCamelCase(collection)]?.publishStage;
  const isPublishable =
    collectionsConfig[dashToCamelCase(collection)]?.isPublishable; // true only if set in config
  const publishLocked =
    cannotPublish !== false &&
    flatData.stage === publishStage &&
    isPublishable === true; // if true, lock the publishing capability

  // publish confirmation modal
  const [showPublishModal, hidePublishModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [confirm, setConfirm] = useState<string>();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [timestamp, setTimestamp] = useState<string | null>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    return (
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <PlainModal
          hideModal={hidePublishModal}
          title={`Publish article`}
          continueButton={{
            text: 'Publish',
            onClick: async () => {
              setIsLoading(true);
              const publishStage: number | undefined =
                collectionsConfig[dashToCamelCase(collection)]?.publishStage;
              if (publishStage) {
                const saved = await saveChanges({
                  stage: publishStage,
                  'timestamps.published_at': timestamp,
                });
                // return whether the action was successful
                setIsLoading(false);
                if (saved === true) return true;
              }
              return false;
            },
            disabled: confirm !== 'confirm',
          }}
          isLoading={isLoading}
        >
          <p style={{ marginTop: 0 }}>
            Before continuing, please{' '}
            <b>
              check the article and its metadata for formatting issues and typos
            </b>
            .
          </p>
          <p>
            Once you publish this article, it will be available for everyone to
            see. Only a few members of The Paladin's Board will be able to
            unpublish this article.
          </p>
          <InputGroup type={`text`}>
            <Label htmlFor={'date'}>Choose publish date and time</Label>
            <DateTime
              value={timestamp}
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
  }, [setFlatData, flatData]);

  const actions: Array<Iaction | null> = [
    {
      label: 'Refresh',
      type: 'icon',
      icon: <ArrowClockwise24Regular />,
      action: () => refetch(),
    },
    collectionsConfig[dashToCamelCase(collection)]?.canWatch
      ? {
          label: isWatching ? 'Stop Watching' : 'Watch',
          type: 'button',
          icon: isWatching ? <EyeHide24Regular /> : <EyeShow24Regular />,
          action: () => watchItem(!isWatching),
        }
      : null,
    {
      label: 'Delete',
      type: 'button',
      icon: <Delete24Regular />,
      action: hideItem,
      color: 'red',
    },
    {
      label: 'Save',
      type: 'button',
      icon: <Save24Regular />,
      action: () => saveChanges(),
      disabled: !hasUnsavedChanges,
    },
    collectionsConfig[dashToCamelCase(collection)]?.isPublishable
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

  return (
    <>
      {props.isEmbedded ? null : (
        <PageHead
          title={data ? data.name : item_id}
          description={`${collection
            .slice(0, 1)
            .toLocaleUpperCase()}${collection
            .slice(1)
            .replace('-', ' ')} collection ${
            hasUnsavedChanges ? ' | Unsaved changes' : ''
          }`}
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
                    >
                      {action.label}
                    </IconButton>
                  );
                }
                if (action.type === 'button') {
                  return (
                    <Button
                      key={index}
                      onClick={action.action}
                      color={action.color}
                      disabled={action.disabled}
                    >
                      {action.label}
                    </Button>
                  );
                }
                return null;
              })}
            </>
          }
          isLoading={isLoading}
        />
      )}

      <PageWrapper theme={theme} isEmbedded={props.isEmbedded}>
        {publishLocked ? (
          <Notice theme={theme}>
            This document is opened in read-only mode because it has been
            published and you do not have publish permissions.
          </Notice>
        ) : null}
        {loading || loadingPermissions
          ? // loading
            'Loading...'
          : //error
          error || flatData.hidden
          ? 'Error loading.'
          : // waiting for user info
          user === undefined || sessionId === null
          ? null
          : // data loaded
            collectionsConfig[dashToCamelCase(collection)]?.fields.map(
              (field, index) => {
                if (field.type === 'text') {
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`text`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <TextInput
                          name={field.label}
                          id={field.key}
                          value={flatData[field.key] as string}
                          onChange={(e) => handleTextChange(e, field.key)}
                          isDisabled={publishLocked ? true : field.isDisabled}
                        />
                      </InputGroup>
                    </ErrorBoundary>
                  );
                }

                if (field.type === 'boolean') {
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`checkbox`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <input
                          type={'checkbox'}
                          name={field.label}
                          id={field.key}
                          checked={!!flatData[field.key]}
                          onChange={(e) =>
                            handleBooleanChange(
                              e.currentTarget.checked,
                              field.key
                            )
                          }
                          disabled={publishLocked ? true : field.isDisabled}
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
                    field.tiptap &&
                    field.tiptap.isHTMLkey &&
                    flatData[field.tiptap.isHTMLkey];
                  const html = isHTML
                    ? (flatData[field.key] as string)
                    : undefined;
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`text`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <div
                          id={field.key}
                          css={css`
                          width: 100%;
                          box-sizing: border-box;
                          border-radius: ${theme.radius};
                          border: none;
                          box-shadow: ${
                            theme.color.neutral[theme.mode][800]
                          } 0px 0px 0px 1px inset;
                          transition: box-shadow 240ms;
                          padding: 2px;
                          height: 400px;
                          overflow: auto;
                          &:hover {
                            box-shadow: ${
                              theme.color.neutral[theme.mode][1000]
                            } 0px 0px 0px 1px inset;
                          }
                          &:focus-within {
                            outline: none;
                            box-shadow: ${
                              theme.color.primary[800]
                            } 0px 0px 0px 2px inset;
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
                            user={{
                              name: user.displayName,
                              color: colorHash.hex(user._id),
                            }}
                            options={field.tiptap}
                            flatData={flatData}
                            setFlatData={setFlatData}
                            isDisabled={
                              publishLocked
                                ? true
                                : isHTML
                                ? true
                                : field.isDisabled
                            }
                            sessionId={sessionId}
                            html={html}
                            onChange={(editorJson: string) => {
                              if (editorJson !== flatData[field.key]) {
                                if (flatData.name) {
                                  setFlatData({
                                    ...flatData,
                                    [field.key]: editorJson,
                                  });
                                }
                                setHasUnsavedChanges(true);
                              }
                            }}
                            actions={actions}
                          />
                        </div>
                      </InputGroup>
                    </ErrorBoundary>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`text`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <Select
                          options={field.options}
                          val={`${flatData[field.key] as string | number}`}
                          onChange={(valueObj) =>
                            handleSelectChange(
                              valueObj ? valueObj.value : '',
                              field.key,
                              typeof flatData[field.key] === 'number'
                                ? 'number'
                                : 'string'
                            )
                          }
                          isDisabled={publishLocked ? true : field.isDisabled}
                        />
                      </InputGroup>
                    </ErrorBoundary>
                  );
                }

                if (field.type === 'select_async') {
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`text`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <Select
                          loadOptions={field.async_options}
                          async
                          val={`${flatData[field.key] as string | number}`}
                          onChange={(valueObj) =>
                            handleSelectChange(
                              valueObj ? valueObj.value : '',
                              field.key,
                              typeof flatData[field.key] === 'number'
                                ? 'number'
                                : 'string'
                            )
                          }
                          isDisabled={publishLocked ? true : field.isDisabled}
                        />
                      </InputGroup>
                    </ErrorBoundary>
                  );
                }

                if (field.type === 'multiselect') {
                  const vals = (
                    flatData[field.key] as (string | number)[]
                  )?.map((val) => val.toString()); // ensures that values are strings
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`text`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <MultiSelect
                          options={field.options}
                          val={vals}
                          onChange={(valueObjs) =>
                            handleMultiselectChange(
                              valueObjs
                                ? valueObjs.map(
                                    (obj: { value: string; number: string }) =>
                                      obj.value
                                  )
                                : '',
                              field.key,
                              field.dataType || 'string'
                            )
                          }
                          isDisabled={publishLocked ? true : field.isDisabled}
                        />
                      </InputGroup>
                    </ErrorBoundary>
                  );
                }

                if (field.type === 'multiselect_async') {
                  const vals = (
                    flatData[field.key] as (string | number)[]
                  )?.map((val) => val.toString()); // ensures that values are strings
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`text`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <MultiSelect
                          loadOptions={field.async_options}
                          async
                          val={vals}
                          onChange={(valueObjs) => {
                            handleMultiselectChange(
                              valueObjs
                                ? valueObjs.map(
                                    (obj: { value: string; label: string }) =>
                                      obj.value
                                  )
                                : '',
                              field.key,
                              field.dataType || 'string'
                            );
                          }}
                          isDisabled={publishLocked ? true : field.isDisabled}
                        />
                      </InputGroup>
                    </ErrorBoundary>
                  );
                }

                if (field.type === 'multiselect_creatable') {
                  const val = flatData[field.key] as string[];
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`text`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <MultiSelect
                          options={field.options}
                          val={val}
                          onChange={(valueObjs) =>
                            handleMultiselectChange(
                              valueObjs
                                ? valueObjs.map(
                                    (obj: { value: string; number: string }) =>
                                      obj.value
                                  )
                                : '',
                              field.key,
                              field.dataType || 'string'
                            )
                          }
                          isCreatable
                          isDisabled={publishLocked ? true : field.isDisabled}
                        />
                      </InputGroup>
                    </ErrorBoundary>
                  );
                }

                if (field.type === 'datetime') {
                  return (
                    <ErrorBoundary
                      fallback={<div>Error loading field '{field.key}'</div>}
                    >
                      <InputGroup type={`text`} key={index}>
                        <Label
                          htmlFor={field.key}
                          description={field.description}
                          disabled={publishLocked ? true : field.isDisabled}
                        >
                          {field.label}
                        </Label>
                        <DateTime
                          value={
                            flatData[field.key] === '0001-01-01T01:00:00.000Z'
                              ? null
                              : (flatData[field.key] as string)
                          }
                          onChange={(date) => {
                            if (date)
                              handleDateTimeChange(
                                date.toUTC().toISO(),
                                field.key
                              );
                          }}
                          isDisabled={publishLocked ? true : field.isDisabled}
                        />
                      </InputGroup>
                    </ErrorBoundary>
                  );
                }

                return (
                  <ErrorBoundary
                    fallback={<div>Error loading field '{field.key}'</div>}
                  >
                    <InputGroup type={`text`} key={index}>
                      <Label
                        htmlFor={field.key}
                        description={field.description}
                        disabled={publishLocked ? true : field.isDisabled}
                      >
                        {field.label}
                      </Label>
                      <pre>{JSON.stringify(field)}</pre>
                    </InputGroup>
                  </ErrorBoundary>
                );
              }
            )}
      </PageWrapper>
    </>
  );
}

const Notice = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  background-color: ${({ theme }) =>
    Color(theme.color.orange[800]).lighten(0.64).hex()};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  padding: 10px 20px;
  position: sticky;
  top: -20px;
  margin: -20px 0 20px -20px;
  width: calc(100% + 40px);
  z-index: 99;
`;

export { ItemDetailsPage };
export type { Iaction };
