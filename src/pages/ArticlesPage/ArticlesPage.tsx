import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { PageHead } from '../../components/PageHead';
import { themeType } from '../../utils/theme/theme';
import { ArticlesTable, IArticlesTableImperative } from './ArticlesTable';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { Button, IconButton } from '../../components/Button';
import { useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

const TableWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: 100%;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  box-sizing: border-box;
`;

function ArticlesPage() {
  const theme = useTheme() as themeType;

  // get the url parameters from the route
  let { progress } = useParams<{ progress: string }>();

  // base page title on route
  const pageTitle = useMemo(() => {
    if (progress === 'in-progress') {
      return 'In-progress articles';
    } else {
      return 'All articles';
    }
  }, [progress]);

  // base page description on route
  const pageDescription = useMemo(() => {
    if (progress === 'in-progress') {
      return `A space to view the articles we are planning, drafting, and editing before they are published`;
    } else {
      return `Every article that is in-progress or published on the web`;
    }
  }, [progress]);

  // define the filters for the table
  const tableFilters = useMemo(() => {
    if (progress === 'in-progress') {
      return [{ id: 'stage', value: 'published' }];
    }
    return [];
  }, [progress]);

  const articlesTableRef = useRef<IArticlesTableImperative>(null);
  return (
    <>
      <PageHead
        title={pageTitle}
        description={pageDescription}
        buttons={
          <>
            <IconButton
              onClick={() => articlesTableRef.current?.refetchData()}
              icon={<ArrowClockwise24Regular />}
            >
              Refresh
            </IconButton>
            <Button>Create new</Button>
          </>
        }
      />
      <TableWrapper theme={theme}>
        <ArticlesTable progress={progress} filters={tableFilters} ref={articlesTableRef} />
      </TableWrapper>
    </>
  );
}

export { ArticlesPage };
