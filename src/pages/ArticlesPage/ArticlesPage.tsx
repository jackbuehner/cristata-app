import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { PageHead } from '../../components/PageHead';
import { themeType } from '../../utils/theme/theme';
import { ArticlesTable, IArticlesTableImperative } from './ArticlesTable';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { Button, IconButton } from '../../components/Button';
import { useMemo, useRef } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { db } from '../../utils/axios/db';
import { toast } from 'react-toastify';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const TableWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: 100%;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  box-sizing: border-box;
`;

function ArticlesPage() {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const location = useLocation();

  // get the url parameters from the route
  let { progress } = useParams<{ progress: string }>();

  const category = new URLSearchParams(location.search).get('category');

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
    let filters: { id: string; value: string }[] = [];
    if (progress === 'in-progress') {
      filters.push({ id: 'stage', value: 'Published' });
      filters.push({ id: 'stage', value: 'Uploaded/Scheduled' });
    }
    if (category) {
      filters.push({ id: 'categories', value: category });
    }
    console.log(filters);
    return filters;
  }, [progress, category]);

  // create new article
  const createNew = () => {
    db.post(`/articles`, {
      name: uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: '-' }),
    })
      .then(({ data }) => history.push(`/cms/item/articles/${data._id}`))
      .catch((err) => {
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  };

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
            <Button onClick={createNew}>Create new</Button>
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
