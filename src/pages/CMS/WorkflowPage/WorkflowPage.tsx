import { gql, useQuery } from '@apollo/client';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Add12Regular, Dismiss12Regular } from '@fluentui/react-icons';
import Color from 'color';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../../../components/Button';
import { WORKFLOW, WORKFLOW__TYPE } from '../../../graphql/queries';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { Column } from './Column';

interface WorkflowPageProps {}

function WorkflowPage(props: WorkflowPageProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: collections } = useQuery<{
    configuration?: { collections?: { name: string; pluralName: string }[] };
  }>(
    gql`
      query {
        configuration {
          collections {
            name
            pluralName
          }
        }
      }
    `,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  const [excluded, setExcluded] = useState<string[]>([]);

  // get the workflow stages for all collections
  const { data, loading, refetch } = useQuery<WORKFLOW__TYPE>(WORKFLOW, {
    variables: { exclude: excluded },
    fetchPolicy: navigator.onLine ? 'network-only' : 'cache-only',
    notifyOnNetworkStatusChange: true,
  });
  useEffect(() => {
    console.log(loading);
    if (loading) dispatch(setAppLoading(true));
    else dispatch(setAppLoading(false));
  }, [dispatch, loading]);

  // get an array of the collection that are included in the returned workflow data
  const [includedCollections, setIncluded] = useState<string[]>([]);
  useEffect(() => {
    if (data?.workflow)
      setIncluded(
        data?.workflow.reduce((arr, col) => {
          const foundCols = col.docs.reduce((arr, doc) => {
            if (!arr.includes(doc.in)) arr.push(doc.in);
            return arr;
          }, [] as string[]);
          arr.push(...foundCols);
          return Array.from(new Set(arr));
        }, [] as string[]) || []
      );
  }, [data]);

  useEffect(() => {
    if (excluded.length > 0) navigate(`?exclude=[${excluded.join(',')}]`);
    else navigate(``); // clear search string
  }, [excluded]);

  // set document title
  useEffect(() => {
    document.title = `Cristata`;
  }, []);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName('Cristata Workflow'));
    dispatch(
      setAppActions([
        {
          label: 'Refetch data',
          action: () => refetch(),
          type: 'icon',
          icon: 'ArrowClockwise16Regular',
        },
      ])
    );
  }, [dispatch]);

  return (
    <PageWrapper>
      <RowContainer>
        <Row>
          {collections?.configuration?.collections
            ?.filter((col) => includedCollections.includes(col.name) || excluded.includes(col.name))
            .sort((a, b) => (b.pluralName || b.name).localeCompare(a.pluralName || a.name))
            .sort((col) => (excluded.includes(col.name) ? 1 : -1))
            .map((col, index: number) => {
              return (
                <FilterChip key={index} negated={excluded.includes(col.name)}>
                  {excluded.includes(col.name) ? <Left negated>Excluded</Left> : null}
                  <Right hasX negated={excluded.includes(col.name)}>
                    {col.pluralName === '__hidden' ? col.name : col.pluralName}
                    <IconButton
                      icon={excluded.includes(col.name) ? <Add12Regular /> : <Dismiss12Regular />}
                      height={'20px'}
                      width={'20px'}
                      backgroundColor={{ base: 'transparent' }}
                      border={{ base: '1px solid transparent' }}
                      color={
                        excluded.includes(col.name) ? (theme.mode === 'light' ? 'red' : 'orange') : 'green'
                      }
                      cssExtra={css`
                        svg {
                          width: 12px !important;
                          height: 12px !important;
                          fill: currentColor;
                        }
                      `}
                      onClick={() => {
                        if (excluded.includes(col.name))
                          setExcluded((excluded) => excluded.filter((name) => name !== col.name));
                        else setExcluded((excluded) => [...excluded, col.name]);
                      }}
                    />
                  </Right>
                </FilterChip>
              );
            })}
        </Row>
      </RowContainer>
      <PlanWrapper columnCount={4}>
        <Column
          id={1}
          title={`Planning`}
          cards={data?.workflow?.find((group) => group._id === 1)?.docs || []}
        />
        <Column id={2} title={`Draft`} cards={data?.workflow?.find((group) => group._id === 2)?.docs || []} />
        <Column
          id={3}
          title={`In review`}
          cards={data?.workflow?.find((group) => group._id === 3)?.docs || []}
        />
        <Column id={4} title={`Ready`} cards={data?.workflow?.find((group) => group._id === 4)?.docs || []} />
      </PlanWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 0;
  height: 100%;
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
`;

const PlanWrapper = styled.div<{ columnCount: number }>`
  padding: 20px;
  height: calc(100% - 46px);
  box-sizing: border-box;
  display: grid;
  grid-template-columns: ${({ columnCount }) => `repeat(${columnCount}, 300px)`};
  gap: 10px;
  overflow: auto;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: no-wrap;
  overflow-y: hidden;
  overflow-x: auto;
  margin: 0 0 -2px 0;
  gap: 6px;
  padding: 20px 20px 0 20px;
  > button {
    flex-shrink: 0;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  overflow-y: hidden;
  overflow-x: auto;
  gap: 6px;
`;

const FilterChip = styled.div<{ negated?: boolean }>`
  height: 26px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  font-size: 13px;
  font-family: ${({ theme }) => theme.font.detail};
  box-shadow: ${({ theme, negated: n }) => {
      const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
      const intensity = theme.mode === 'light' ? 800 : 300;
      const transformColor = (color: string) => Color(color).alpha(0.8).string();
      return transformColor(theme.color[color][intensity]);
    }}
    0px 0px 0px 1.25px inset !important;
  border-radius: ${({ theme }) => theme.radius};
  user-select: none;
`;

const Left = styled.div<{ negated?: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  align-items: center;
  font-weight: 500;
  color: ${({ theme, negated: n }) => {
    const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
    const intensity = theme.mode === 'light' ? 100 : 1400;
    const transformColor = (color: string) => Color(color).string();
    return transformColor(theme.color[color][intensity]);
  }};
  background-color: ${({ theme, negated: n }) => {
    const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
    const intensity = theme.mode === 'light' ? 800 : 300;
    const transformColor = (color: string) => Color(color).alpha(0.8).string();
    return transformColor(theme.color[color][intensity]);
  }};
  border-radius: ${({ theme }) => theme.radius} 0 0 ${({ theme }) => theme.radius};
  box-sizing: border-box;
  padding: 4px 8px;
`;

const Right = styled.div<{ negated?: boolean; hasX: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 3px;
  white-space: nowrap;
  align-items: center;
  font-weight: 400;
  color: ${({ theme, negated: n }) => {
    const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
    const intensity = theme.mode === 'light' ? 800 : 300;
    const transformColor = (color: string) => Color(color).string();
    return transformColor(theme.color[color][intensity]);
  }};
  background-color: ${({ theme, negated: n }) => {
    const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
    const intensity = theme.mode === 'light' ? 800 : 300;
    const transformColor = (color: string) => Color(color).alpha(0.1).string();
    return transformColor(theme.color[color][intensity]);
  }};
  border-radius: 0 ${({ theme }) => theme.radius} ${({ theme }) => theme.radius} 0;
  box-sizing: border-box;
  padding: 4px ${({ hasX }) => (hasX ? 3 : 8)}px 4px 8px;
  svg {
    color: ${({ theme, negated: n }) => {
      const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
      const intensity = theme.mode === 'light' ? 800 : 300;
      const transformColor = (color: string) => Color(color).string();
      return transformColor(theme.color[color][intensity]);
    }};
  }
`;

export { WorkflowPage };
