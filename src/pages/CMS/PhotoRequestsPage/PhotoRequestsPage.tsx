import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { useMemo, useRef, useState } from 'react';
import { Button, IconButton } from '../../../components/Button';
import { PageHead } from '../../../components/PageHead';
import { db } from '../../../utils/axios/db';
import { toast } from 'react-toastify';
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import { useHistory, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import {
  IPhotoRequestsImperative,
  PhotoRequestsTable,
} from './PhotoRequestsTable';
import styled from '@emotion/styled/macro';

function PhotoRequestsPage() {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);

  // get the url parameters from the route
  let { progress } = useParams<{ progress: string }>();

  // define the filters for the table
  const tableFilters = useMemo(() => {
    let filters: { id: string; value: string }[] = [
      { id: 'hidden', value: 'true' },
    ];
    if (progress === 'unfulfilled') {
      filters.push({ id: 'stage', value: 'Fulfilled' });
    }
    return filters;
  }, [progress]);

  // create new photo request
  const createNew = () => {
    setIsLoading(true);
    db.post(`/photo-requests`, {
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
      }),
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
            <IconButton
              onClick={() => tableRef.current?.refetchData()}
              icon={<ArrowClockwise24Regular />}
            >
              Refresh
            </IconButton>
            <Button onClick={createNew}>Create new</Button>
          </>
        }
      />
      <TableWrapper theme={theme}>
        <PhotoRequestsTable
          progress={progress}
          filters={tableFilters}
          ref={tableRef}
          setIsLoading={setIsLoading}
        />
      </TableWrapper>
    </>
  );
}

const TableWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
`;

export { PhotoRequestsPage };
