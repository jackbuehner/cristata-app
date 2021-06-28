import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { useRef, useState } from 'react';
import { Button, IconButton } from '../../../components/Button';
import { PageHead } from '../../../components/PageHead';
import { db } from '../../../utils/axios/db';
import { toast } from 'react-toastify';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { useHistory } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import { IPhotoRequestsImperative, PhotoRequestsTable } from './PhotoRequestsTable';
import styled from '@emotion/styled';

function PhotoRequestsPage() {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);

  // create new photo request
  const createNew = () => {
    setIsLoading(true);
    db.post(`/photo-requests`, {
      name: uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: '-' }),
    })
      .then(({ data }) => {
        setIsLoading(false);
        history.push(`/cms/item/photo-requests/${data._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  };

  const tableRef = useRef<IPhotoRequestsImperative>(null);
  return (
    <>
      <PageHead
        title={`Photo requests`}
        description={`If a photo you need is not in the photo library, make a request here.`}
        isLoading={isLoading}
        buttons={
          <>
            <IconButton onClick={() => tableRef.current?.refetchData()} icon={<ArrowClockwise24Regular />}>
              Refresh
            </IconButton>
            <Button onClick={createNew}>Create new</Button>
          </>
        }
      />
      <TableWrapper theme={theme}>
        <PhotoRequestsTable ref={tableRef} setIsLoading={setIsLoading} />
      </TableWrapper>
    </>
  );
}

const TableWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: 100%;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  box-sizing: border-box;
`;

export { PhotoRequestsPage };
