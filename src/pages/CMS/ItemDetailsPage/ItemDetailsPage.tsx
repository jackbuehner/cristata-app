/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
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
import { InputGroup } from '../../../components/InputGroup';
import { collections as collectionsConfig } from '../../../config';
import styled from '@emotion/styled/macro';
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
import { IProfile } from '../../../interfaces/cristata/profiles';
import { genAvatar } from '../../../utils/genAvatar';
import { setFields, setField, setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';

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
  isEmbedded?: boolean; // controls whether header, padding, tiptap, etc are hidden
}

function ItemDetailsPage(props: IItemDetailsPage) {
  const state = useAppSelector((state) => state.cmsItem);
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const history = useHistory();
  const { search } = useLocation();

  const [{ data: profile }] = useAxios<IProfile>(`/users/me`);

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
  const [{ data, loading, error }, refetch] = useAxios<{ [key: string]: any }>(`/${collectionName}/${item_id}`);
  useEffect(() => {
    dispatch(setIsLoading(loading));
  }, [dispatch, loading]);

  // save the item to redux
  useEffect(() => {
    if (data) dispatch(setFields(data));
  }, [data, dispatch]);

  // set document title
  useEffect(() => {
    document.title = `${state.isUnsaved ? '*' : ''}${state.fields.name || item_id} - Cristata`;
  }, [data, item_id, state.fields.name, state.isUnsaved]);

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
    setIsLoading(true);

    // patch to database
    return await db
      .patch(
        `/${collectionName}/${item_id}`,
        unflattenObject({ ...state.unsavedFields, ...state.tipTapFields, ...extraData })
      )
      .then(() => {
        setIsLoading(false);
        toast.success(`Changes successfully saved.`);
        refetch();
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
        history.push(collectionsConfig[dashToCamelCase(collection)]?.home || '/');
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
        refetch();
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
    if (user && data?.people?.watching && JSON.stringify(data.people.watching).includes(user.id))
      // stringify it since it can be either a profile id or a profile object
      setIsWatching(true);
    else setIsWatching(false);
  }, [user, data]);

  // store whether the user is a mandatory watcher
  const [isMadatoryWatcher, setIsMandatoryWatcher] = useState<boolean>();
  useEffect(() => {
    // get the mandatory watchers
    const mandatoryWatchersKeys = collectionsConfig[dashToCamelCase(collection)]?.mandatoryWatchers;
    const mandatoryWatchers = mandatoryWatchersKeys
      ?.map((key) => JSON.stringify(state.fields[key]))
      .filter((watcher) => watcher !== undefined); // stringify it since it can be either a profile id or a profile object

    // set if current user is a mandatory watcher by checking if the user is inside `mandatoryWatchers`
    if (user && mandatoryWatchers && JSON.stringify(mandatoryWatchers).includes(user.id))
      setIsMandatoryWatcher(true);
    else setIsMandatoryWatcher(false);
  }, [collection, user, state.fields]);

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // determine whether the user can publish the item
  const [{ data: permissions, loading: loadingPermissions }] = useAxios<{
    canPublish: boolean;
  }>(`/${collection}/permissions`);

  // calculate publish permissions
  const cannotPublish = permissions?.canPublish !== true;
  const publishStage: number | undefined = collectionsConfig[dashToCamelCase(collection)]?.publishStage;
  const isPublishable = collectionsConfig[dashToCamelCase(collection)]?.isPublishable; // true only if set in config
  const publishLocked =
    cannotPublish !== false && state.fields.stage === publishStage && isPublishable === true; // if true, lock the publishing capability

  // publish confirmation modal
  const [showPublishModal, hidePublishModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [confirm, setConfirm] = useState<string>();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [timestamp, setTimestamp] = useState<string>(state.fields['timestamps.published_at'] as string);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [updatedTimestamp, setUpdatedTimestamp] = useState<string>(
      state.fields['timestamps.updated_at'] as string
    );
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
                  'timestamps.updated_at': updatedTimestamp,
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
          {
            // if the article has already been published, allow setting an update timestamp
            state.fields['timestamps.published_at'] !== '0001-01-01T01:00:00.000Z' ? (
              <InputGroup type={`text`}>
                <Label
                  htmlFor={'date'}
                  description={'Use this field if the contents of the article were updated after publish.'}
                >
                  Choose updated date and time
                </Label>
                <DateTime
                  value={updatedTimestamp === '0001-01-01T01:00:00.000Z' ? null : updatedTimestamp}
                  onChange={(date) => {
                    if (date) setUpdatedTimestamp(date.toUTC().toISO());
                  }}
                  placeholder={'Pick a time'}
                />
              </InputGroup>
            ) : null
          }
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
    collectionsConfig[dashToCamelCase(collection)]?.canWatch
      ? {
          label: isWatching || isMadatoryWatcher ? 'Stop Watching' : 'Watch',
          type: 'button',
          icon: isWatching || isMadatoryWatcher ? <EyeHide24Regular /> : <EyeShow24Regular />,
          disabled: isMadatoryWatcher,
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
      disabled: !state.isUnsaved,
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

  // variable with the fs search param
  const fs = new URLSearchParams(search).get('fs');

  return (
    <>
      {props.isEmbedded ? null : (
        <PageHead
          title={data && data.name ? data.name : item_id}
          description={`${collection.slice(0, 1).toLocaleUpperCase()}${collection
            .slice(1)
            .replace('-', ' ')} collection ${state.isUnsaved ? ' | Unsaved changes' : ''}`}
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

      <PageWrapper theme={theme} isEmbedded={props.isEmbedded}>
        {publishLocked && !props.isEmbedded ? (
          <Notice theme={theme}>
            This document is opened in read-only mode because it has been published and you do not have publish
            permissions.
          </Notice>
        ) : null}
        {(state.isLoading && !data) || (isPublishable ? loadingPermissions : false) ? (
          // loading
          'Loading...'
        ) : //error
        error || state.fields.hidden ? (
          <div>
            Error loading.
            <pre>
              <code>{JSON.stringify(error, null, 2)}</code>
            </pre>
          </div>
        ) : // waiting for user info
        user === undefined || sessionId === null ? null : (
          // data loaded
          collectionsConfig[dashToCamelCase(collection)]?.fields.map((field, index) => {
            if (field.type === 'text') {
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={field.key}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <TextInput
                      name={field.label}
                      id={field.key}
                      value={
                        field.modifyValue
                          ? field.modifyValue(state.fields[field.key] as string, state.fields)
                          : (state.fields[field.key] as string)
                      }
                      onChange={(e) => handleTextChange(e, field.key)}
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'boolean') {
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`checkbox`}>
                    <Label
                      htmlFor={field.key}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <input
                      type={'checkbox'}
                      name={field.label}
                      id={field.key}
                      checked={!!state.fields[field.key]}
                      onChange={(e) => handleBooleanChange(e.currentTarget.checked, field.key)}
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
              const isHTML = field.tiptap && field.tiptap.isHTMLkey && state.fields[field.tiptap.isHTMLkey];
              const html = isHTML ? (state.fields[field.key] as string) : undefined;
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={field.key}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
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
                        user={{
                          name: user.displayName,
                          color: colorHash.hex(user._id || user.id),
                          photo: profile?.photo ? profile.photo : genAvatar(user._id || user.id),
                        }}
                        options={field.tiptap}
                        isDisabled={state.isLoading || publishLocked ? true : isHTML ? true : field.isDisabled}
                        showLoading={state.isLoading}
                        sessionId={sessionId}
                        html={html}
                        isMaximized={fs === '1' || fs === 'force'}
                        forceMax={fs === 'force'}
                        onChange={(editorJson: string) => {
                          if (editorJson !== state.fields[field.key]) {
                            setField(editorJson, field.key, 'tiptap');
                          }
                        }}
                        actions={actions}
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

            if (field.type === 'select') {
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={field.key}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <Select
                      options={field.options}
                      val={
                        field.modifyValue
                          ? field.modifyValue(`${state.fields[field.key] as string | number}`, state.fields)
                          : `${state.fields[field.key] as string | number}`
                      }
                      onChange={(valueObj) =>
                        handleSelectChange(
                          valueObj ? valueObj.value : '',
                          field.key,
                          typeof state.fields[field.key] === 'number' ? 'number' : 'string'
                        )
                      }
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'select_async') {
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={field.key}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <Select
                      loadOptions={field.async_options}
                      async
                      val={
                        field.modifyValue
                          ? field.modifyValue(`${state.fields[field.key] as string | number}`, state.fields)
                          : `${state.fields[field.key] as string | number}`
                      }
                      onChange={(valueObj) =>
                        handleSelectChange(
                          valueObj ? valueObj.value : '',
                          field.key,
                          typeof state.fields[field.key] === 'number' ? 'number' : 'string'
                        )
                      }
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'multiselect') {
              const vals = (state.fields[field.key] as (string | number)[])?.map((val) =>
                field.modifyValue ? field.modifyValue(val, state.fields) : val.toString()
              ); // ensures that values are strings
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={field.key}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <MultiSelect
                      options={field.options}
                      val={vals}
                      onChange={(valueObjs) =>
                        handleMultiselectChange(
                          valueObjs ? valueObjs.map((obj: { value: string; number: string }) => obj.value) : '',
                          field.key,
                          field.dataType || 'string'
                        )
                      }
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'multiselect_async') {
              const vals = (state.fields[field.key] as (string | number)[])?.map((val) =>
                field.modifyValue ? field.modifyValue(val, state.fields) : val.toString()
              ); // ensures that values are strings
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={field.key}
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
                          field.key,
                          field.dataType || 'string'
                        );
                      }}
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'multiselect_creatable') {
              const val = (state.fields[field.key] as string[])?.map((val) =>
                field.modifyValue ? field.modifyValue(val, state.fields) : val
              );
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={field.key}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <MultiSelect
                      options={field.options}
                      val={val}
                      onChange={(valueObjs) =>
                        handleMultiselectChange(
                          valueObjs ? valueObjs.map((obj: { value: string; number: string }) => obj.value) : '',
                          field.key,
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

            if (field.type === 'datetime') {
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label
                      htmlFor={field.key}
                      description={field.description}
                      disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    >
                      {field.label}
                    </Label>
                    <DateTime
                      value={
                        state.fields[field.key] === '0001-01-01T01:00:00.000Z'
                          ? null
                          : field.modifyValue
                          ? field.modifyValue(state.fields[field.key] as string, state.fields)
                          : (state.fields[field.key] as string)
                      }
                      onChange={(date) => {
                        if (date) handleDateTimeChange(date.toUTC().toISO(), field.key);
                      }}
                      isDisabled={state.isLoading || publishLocked ? true : field.isDisabled}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            return (
              <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                <InputGroup type={`text`}>
                  <Label
                    htmlFor={field.key}
                    description={field.description}
                    disabled={state.isLoading || publishLocked ? true : field.isDisabled}
                  >
                    {field.label}
                  </Label>
                  <pre>{JSON.stringify(field)}</pre>
                </InputGroup>
              </ErrorBoundary>
            );
          })
        )}
      </PageWrapper>
    </>
  );
}

const Notice = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  background-color: ${({ theme }) => Color(theme.color.orange[800]).lighten(0.64).hex()};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  padding: 10px 20px;
  position: sticky;
  top: -20px;
  margin: -20px 0 20px -20px;
  width: 100%;
  z-index: 99;
`;

export { ItemDetailsPage };
export type { Iaction };
