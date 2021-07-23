import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { PageHead } from '../../../components/PageHead';
import { themeType } from '../../../utils/theme/theme';
import { SatireTable, ISatireTableImperative } from './SatireTable';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { Button, IconButton } from '../../../components/Button';
import { useMemo, useRef, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { db } from '../../../utils/axios/db';
import { toast } from 'react-toastify';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const TableWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
`;

function SatirePage() {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const location = useLocation();

  // get the url parameters from the route
  let { progress } = useParams<{ progress: string }>();

  const category = new URLSearchParams(location.search).get('category');

  // base page title on route
  const pageTitle = useMemo(() => {
    if (progress === 'in-progress' && category) {
      return `In-progress ${category}${category === 'opinion' ? `s` : ` satire`}`;
    } else if (progress === 'in-progress') {
      return 'In-progress satire';
    } else {
      return 'All satire';
    }
  }, [progress, category]);

  // base page description on route
  const pageDescription = useMemo(() => {
    if (progress === 'in-progress' && category) {
      return `The ${category}${
        category === 'opinion' ? `s` : ` satire`
      } we are planning, drafting, and editing.`;
    } else if (progress === 'in-progress') {
      return `The satire we are planning, drafting, and editing.`;
    } else {
      return `Every piece of satire that is in-progress or published on the web.`;
    }
  }, [progress, category]);

  // define the filters for the table
  const tableFilters = useMemo(() => {
    let filters: { id: string; value: string }[] = [{ id: 'hidden', value: 'true' }];
    if (progress === 'in-progress') {
      filters.push({ id: 'stage', value: 'Published' });
      filters.push({ id: 'stage', value: 'Uploaded/Scheduled' });
    }
    if (category) {
      filters.push({ id: 'categories', value: category });
    }
    return filters;
  }, [progress, category]);

  // create new satire
  const createNew = () => {
    db.post(`/satire`, {
      name: uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: '-' }),
    })
      .then(({ data }) => history.push(`/cms/item/satire/${data._id}`))
      .catch((err) => {
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  };

  const [isLoading, setIsLoading] = useState(true);

  const satireTableRef = useRef<ISatireTableImperative>(null);
  return (
    <>
      <PageHead
        title={pageTitle}
        description={pageDescription}
        isLoading={isLoading}
        buttons={
          <>
            <IconButton
              onClick={() => satireTableRef.current?.refetchData()}
              icon={<ArrowClockwise24Regular />}
            >
              Refresh
            </IconButton>
            <Button onClick={createNew}>Create new</Button>
          </>
        }
      />
      <TableWrapper theme={theme}>
        <SatireTable
          progress={progress}
          filters={tableFilters}
          ref={satireTableRef}
          setIsLoading={setIsLoading}
        />
      </TableWrapper>
    </>
  );
}

export { SatirePage };