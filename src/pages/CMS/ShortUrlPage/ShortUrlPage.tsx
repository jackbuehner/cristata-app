import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { useMemo, useRef, useState } from 'react';
import { Button, IconButton } from '../../../components/Button';
import { PageHead } from '../../../components/PageHead';
import { db } from '../../../utils/axios/db';
import { toast } from 'react-toastify';
import { useHistory, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import { IShortUrlImperative, ShortUrlTable } from './ShortUrlTable';
import styled from '@emotion/styled/macro';

function ShortUrlPage() {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);

  // get the url parameters from the route
  let { progress } = useParams<{ progress: string }>();

  // define the filters for the table
  const tableFilters = useMemo(() => {
    let filters: { id: string; value: string }[] = [{ id: 'hidden', value: 'true' }];
    if (progress === 'unfulfilled') {
      filters.push({ id: 'stage', value: 'Fulfilled' });
    }
    return filters;
  }, [progress]);

  // create new short url
  const createNew = () => {
    setIsLoading(true);
    db.post(`/shorturl`)
      .then(({ data }) => {
        setIsLoading(false);
        history.push(`/cms/item/shorturl/${data.code}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  };

  const tableRef = useRef<IShortUrlImperative>(null);
  return (
    <>
      <PageHead
        title={`Short URLs`}
        description={`Generate short URLs that redirect to other pages.`}
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
        <ShortUrlTable progress={progress} filters={tableFilters} ref={tableRef} setIsLoading={setIsLoading} />
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

export { ShortUrlPage };
