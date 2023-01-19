import GraphiQLExplorer from '@cristata/graphiql-explorer';
/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import { SideNavHeading } from '../../components/Heading';
import { Offline } from '../../components/Offline';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setExplorerIsOpen, setQuery } from '../../redux/slices/graphiqlSlice';
import type { themeType } from '../../utils/theme/theme';

interface PlaygroundNavigationProps {}

function PlaygroundNavigation(props: PlaygroundNavigationProps) {
  const theme = useTheme() as themeType;
  const state = useAppSelector((state) => state.graphiql);
  const dispatch = useAppDispatch();

  if (!state.schema && !navigator.onLine) {
    return <Offline variant={'small'} key={0} />;
  }

  return (
    <>
      <div
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        css={css`
          .docExplorerWrap {
            display: flex !important;
            width: 100% !important;
            min-width: unset !important;
            overflow: auto !important;
            height: calc(100% + 10px) !important;
            margin-top: -10px !important;
            padding: 8px 8px 8px 10px;
            box-sizing: border-box;
          }
          .doc-explorer-title-bar,
          .graphiql-explorer-root > div:last-of-type,
          .graphiql-operation-title-bar {
            display: none !important;
          }
          .graphiql-explorer-root {
            padding: 0 !important;
          }
          .graphiql-explorer-root > div:first-of-type {
            overflow: hidden !important;
          }
          .graphiql-explorer-node > span {
            height: 24px;
            align-items: center;
          }
          .graphiql-explorer-node {
            padding-left: 8px;
          }
          .graphiql-explorer-field-view,
          .graphiql-explorer-graphql-arguments * {
            color: ${theme.color.neutral[theme.mode][1400]} !important;
          }
          .graphiql-explorer-graphql-arguments input,
          .graphiql-explorer-graphql-arguments button {
            background: none !important;
            font-family: 'Dank Mono', monospace;
          }
        `}
      >
        <SideNavHeading>API Explorer</SideNavHeading>
        <GraphiQLExplorer
          schema={state.schema}
          query={state.query}
          onEdit={(query: string | undefined) => dispatch(setQuery(query))}
          explorerIsOpen={state.explorerIsOpen}
          onToggleExplorer={() => dispatch(setExplorerIsOpen(!state.explorerIsOpen))}
        />
      </div>
    </>
  );
}

export { PlaygroundNavigation };
