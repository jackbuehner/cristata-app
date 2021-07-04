/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { themeType } from '../../../utils/theme/theme';
import { PageHead } from '../../../components/PageHead';
import { Button, IconButton } from '../../../components/Button';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
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

const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5 });

const PageWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
  overflow: auto;
`;

function ItemDetailsPage() {
  const theme = useTheme() as themeType;
  const history = useHistory();

  // get the url parameters from the route
  let { collection, item_id } = useParams<{
    collection: string;
    item_id: string;
  }>();

  // get the item
  const [{ data, loading, error }, refetch] = useAxios(`/${collection}/${item_id}`);

  // store whether the page is loading/updating/saving
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // keep track of whether changes have been made that have not been saved
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // save a flattened version of the data in state for modification
  const [flatData, setFlatData] = useState<{ [key: string]: string | string[] | number | number[] }>({});
  useEffect(() => {
    if (data) {
      setFlatData(flattenObject(data));
      setHasUnsavedChanges(false);
    }
  }, [data]);

  //
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
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
  const handleSelectChange = (value: string | number, key: string, type: string) => {
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
  const handleMultiselectChange = (value: string[] | number[], key: string, type: string) => {
    if (type === 'number') value = value.map((val: string | number) => parseInt(`${val}`));
    if (type === 'string') value = value.map((val: string | number) => val.toString());
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

  // save changes to the databse
  const saveChanges = () => {
    setIsLoading(true);
    db.patch(`/${collection}/${item_id}`, unflattenObject(flatData))
      .then(() => {
        setIsLoading(false);
        toast.success(`Changes successfully saved.`);
        refetch();
        setHasUnsavedChanges(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  };

  // set the item to hidden
  const hideItem = () => {
    setIsLoading(true);
    db.patch(`/${collection}/${item_id}`, { ...data, hidden: true })
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

  // get the user data from localstorage
  const [user, setUser] = useState<IAuthUser>();
  useEffect(() => {
    const userJson = localStorage.getItem('auth.user');
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
  }, []);

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // TODO: add check for whether the user can publish the item
  // TODO: If the article is published, only allow user to make changes if they have publish permissons

  return (
    <>
      <PageHead
        title={data ? data.name : item_id}
        description={`${collection.slice(0, 1).toLocaleUpperCase()}${collection
          .slice(1)
          .replace('-', ' ')} collection ${hasUnsavedChanges ? ' | Unsaved changes' : ''}`}
        buttons={
          <>
            <IconButton onClick={() => refetch()} icon={<ArrowClockwise24Regular />}>
              Refresh
            </IconButton>
            <Button onClick={hideItem} color={'red'}>
              Delete
            </Button>
            <Button onClick={saveChanges} disabled={!hasUnsavedChanges}>
              Save
            </Button>
            {collectionsConfig[dashToCamelCase(collection)]?.isPublishable ? (
              <Button disabled>Publish</Button>
            ) : null}
          </>
        }
        isLoading={isLoading}
      />

      <PageWrapper theme={theme}>
        {loading
          ? // loading
            'Loading...'
          : //error
          error || flatData.hidden
          ? 'Error loading.'
          : // waiting for user info
          user === undefined || sessionId === null
          ? null
          : // data loaded
            collectionsConfig[dashToCamelCase(collection)]?.fields.map((field, index) => {
              if (field.type === 'text') {
                return (
                  <InputGroup type={`text`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
                      {field.label}
                    </Label>
                    <TextInput
                      name={field.label}
                      id={field.key}
                      value={flatData[field.key] as string}
                      onChange={(e) => handleTextChange(e, field.key)}
                      isDisabled={field.isDisabled}
                    />
                  </InputGroup>
                );
              }

              if (field.type === 'boolean') {
                return (
                  <InputGroup type={`checkbox`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
                      {field.label}
                    </Label>
                    <input type={'checkbox'} name={field.label} id={field.key} disabled={field.isDisabled} />
                  </InputGroup>
                );
              }

              if (field.type === 'tiptap') {
                return (
                  <InputGroup type={`text`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
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
                          color: colorHash.hex(user._id),
                        }}
                        options={field.tiptap}
                        flatData={flatData}
                        setFlatData={setFlatData}
                        isDisabled={field.isDisabled}
                        sessionId={sessionId}
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
                      />
                    </div>
                  </InputGroup>
                );
              }

              if (field.type === 'select') {
                return (
                  <InputGroup type={`text`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
                      {field.label}
                    </Label>
                    <Select
                      options={field.options}
                      val={`${flatData[field.key] as string | number}`}
                      onChange={(valueObj) =>
                        handleSelectChange(
                          valueObj ? valueObj.value : '',
                          field.key,
                          typeof flatData[field.key] === 'number' ? 'number' : 'string'
                        )
                      }
                    />
                  </InputGroup>
                );
              }

              if (field.type === 'select_async') {
                return (
                  <InputGroup type={`text`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
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
                          typeof flatData[field.key] === 'number' ? 'number' : 'string'
                        )
                      }
                    />
                  </InputGroup>
                );
              }

              if (field.type === 'multiselect') {
                const vals = (flatData[field.key] as (string | number)[])?.map((val) => val.toString()); // ensures that values are strings
                return (
                  <InputGroup type={`text`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
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
                      isDisabled={field.isDisabled}
                    />
                  </InputGroup>
                );
              }

              if (field.type === 'multiselect_async') {
                const vals = (flatData[field.key] as (string | number)[])?.map((val) => val.toString()); // ensures that values are strings
                return (
                  <InputGroup type={`text`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
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
                      isDisabled={field.isDisabled}
                    />
                  </InputGroup>
                );
              }

              if (field.type === 'multiselect_creatable') {
                const val = flatData[field.key] as string[];
                return (
                  <InputGroup type={`text`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
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
                      isDisabled={field.isDisabled}
                    />
                  </InputGroup>
                );
              }

              if (field.type === 'datetime') {
                return (
                  <InputGroup type={`text`} key={index}>
                    <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
                      {field.label}
                    </Label>
                    <DateTime
                      value={
                        flatData[field.key] === '0001-01-01T01:00:00.000Z'
                          ? null
                          : (flatData[field.key] as string)
                      }
                      onChange={(date) => {
                        if (date) handleDateTimeChange(date.toUTC().toISO(), field.key);
                      }}
                      isDisabled={field.isDisabled}
                    />
                  </InputGroup>
                );
              }

              return (
                <InputGroup type={`text`} key={index}>
                  <Label htmlFor={field.key} description={field.description} disabled={field.isDisabled}>
                    {field.label}
                  </Label>
                  <pre>{JSON.stringify(field)}</pre>
                </InputGroup>
              );
            })}
      </PageWrapper>
    </>
  );
}

export { ItemDetailsPage };
