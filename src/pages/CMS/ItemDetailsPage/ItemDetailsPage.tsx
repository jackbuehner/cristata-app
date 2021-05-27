/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

const colorHash = new ColorHash({ saturation: 0.9, lightness: 0.4 });

const PageWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: 100%;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  box-sizing: border-box;
  overflow: auto;
`;

function ItemDetailsPage() {
  const theme = useTheme() as themeType;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // get the url parameters from the route
  let { collection, item_id } =
    useParams<{
      collection: string;
      item_id: string;
    }>();

  // get the item
  const [{ data }, refetch] = useAxios(`/${collection}/${item_id}`);

  // save a flattened version of the data in state for modification
  const [flatData, setFlatData] = useState<{ [key: string]: string | string[] }>({});
  useEffect(() => {
    if (data) setFlatData(flattenObject(data));
  }, [data]);

  //
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    setFlatData({
      ...flatData,
      [key]: e.currentTarget.value,
    });
  };

  // save changes to the databse
  const saveChanges = () => {
    setIsLoading(true);
    db.patch(`/${collection}/${item_id}`, unflattenObject(flatData))
      .then(() => {
        setIsLoading(false);
        toast.success(`Changes successfully saved.`);
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  };

  // TODO: add check for whether the user can publish the item
  // TODO: If the article is published, only allow user to make changes if they have publish permissons

  return (
    <>
      <PageHead
        title={data ? data.name : item_id}
        description={`${collection.slice(0, 1).toLocaleUpperCase()}${collection.slice(1)} collection`}
        buttons={
          <>
            <IconButton onClick={() => refetch} icon={<ArrowClockwise24Regular />}>
              Refresh
            </IconButton>
            <Button onClick={saveChanges}>Save</Button>
          </>
        }
        isLoading={isLoading}
      />

      <PageWrapper theme={theme}>
        {collectionsConfig[collection]?.fields.map((field, index) => {
          if (field.type === 'text') {
            return (
              <InputGroup type={`text`} key={index}>
                <Label htmlFor={field.key} description={field.description}>
                  {field.label}
                </Label>
                <TextInput
                  name={field.label}
                  id={field.key}
                  value={flatData[field.key] as string}
                  onChange={(e) => handleTextChange(e, field.key)}
                />
              </InputGroup>
            );
          }

          if (field.type === 'boolean') {
            return (
              <InputGroup type={`checkbox`} key={index}>
                <Label htmlFor={field.key} description={field.description}>
                  {field.label}
                </Label>
                <input type={'checkbox'} name={field.label} id={field.key} />
              </InputGroup>
            );
          }

          if (field.type === 'tiptap') {
            return (
              <InputGroup type={`text`} key={index}>
                <Label htmlFor={field.key} description={field.description}>
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
                      name: 'Jack Buehner',
                      color: colorHash.hex('Jack Buehner'),
                    }}
                    options={field.tiptap}
                    flatData={flatData}
                    setFlatData={setFlatData}
                  />
                </div>
              </InputGroup>
            );
          }

          return (
            <InputGroup type={`text`} key={index}>
              <Label htmlFor={field.key} description={field.description}>
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
