import { compactMode } from '$stores/compactMode';
import GraphiQLExplorer from '@cristata/graphiql-explorer';
import { css, useTheme } from '@emotion/react';
import { useStore } from 'svelte-preprocess-react';
import { Offline } from '../../components/Offline';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setExplorerIsOpen, setQuery } from '../../redux/slices/graphiqlSlice';
import type { themeType } from '../../utils/theme/theme';

interface PlaygroundNavigationProps {}

function PlaygroundNavigation(props: PlaygroundNavigationProps) {
  const theme = useTheme() as themeType;
  const state = useAppSelector((state) => state.graphiql);
  const dispatch = useAppDispatch();
  const $compactMode = useStore(compactMode);

  if (!state.schema && !navigator.onLine) {
    return <Offline variant={'small'} key={0} />;
  }

  return (
    <>
      <div
        css={css`
          .docExplorerWrap {
            display: block !important;
            width: 100% !important;
            min-width: unset !important;
            padding: 0 8px;
            box-sizing: border-box;
            height: 100% !important;
            overflow: auto !important;
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
            height: ${$compactMode ? 22 : 30}px;
            margin: ${$compactMode ? 1 : 3}px 0;
            align-items: center;
            position: relative;
            cursor: default !important;
          }
          .graphiql-explorer-node > span::before {
            content: '';
            width: 100%;
            height: 100%;
            position: absolute;
            padding: 0 20px;
            left: -20px;
            border-radius: var(--fds-control-corner-radius);
          }
          .graphiql-explorer-node > span:hover::before {
            background-color: var(--fds-subtle-fill-secondary);
          }
          .graphiql-explorer-node > span:active::before {
            background-color: var(--fds-subtle-fill-tertiary);
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
