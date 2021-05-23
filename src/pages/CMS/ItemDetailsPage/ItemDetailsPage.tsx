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
import axios from 'axios';
import { db } from '../../../utils/axios/db';
import { unflattenObject } from '../../../utils/unflattenObject';
import { toast } from 'react-toastify';

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
  const [{ data, loading, error }, refetch] = useAxios(`/${collection}/${item_id}`);

  // save a flattened version of the data in state for modification
  const [flatData, setFlatData] = useState<{ [key: string]: string }>({});
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
            <IconButton onClick={() => null} icon={<ArrowClockwise24Regular />}>
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
              <InputGroup type={`text`}>
                <Label htmlFor={field.key} description={field.description}>
                  {field.label}
                </Label>
                <TextInput
                  name={field.label}
                  id={field.key}
                  value={flatData[field.key]}
                  onChange={(e) => handleTextChange(e, field.key)}
                />
              </InputGroup>
            );
          }

          if (field.type === 'boolean') {
            return (
              <InputGroup type={`checkbox`}>
                <Label htmlFor={field.key} description={field.description}>
                  {field.label}
                </Label>
                <input type={'checkbox'} name={field.label} id={field.key} />
              </InputGroup>
            );
          }

          return (
            <InputGroup type={`text`}>
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