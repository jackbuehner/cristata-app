/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import axios from 'axios';
import Color from 'color';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import { buildClientSchema, getIntrospectionQuery } from 'graphql';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Offline } from '../../components/Offline';
import { PageHead } from '../../components/PageHead';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setAppName, setAppActions, setAppLoading } from '../../redux/slices/appbarSlice';
import { setQuery, setSchema } from '../../redux/slices/graphiqlSlice';
import { server } from '../../utils/constants';
import { themeType } from '../../utils/theme/theme';

/**
 * A modified version of `fetch` that always includes credentials (cookies)
 */
function fetchWithCredentials(url: RequestInfo, options?: RequestInit): Promise<Response> {
  return fetch(url, { ...options, credentials: 'include' });
}

const defaultQuery = `query {
  user {
    name
    username
    email
  }
}
`;

interface PlaygroundProps {
  setThemeMode: Dispatch<SetStateAction<'light' | 'dark'>>;
}

function Playground({ setThemeMode }: PlaygroundProps) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const state = useAppSelector((state) => state.graphiql);
  const dispatch = useAppDispatch();
  const graphiqlRef = useRef<GraphiQL>(null);

  const tenant = localStorage.getItem('tenant');

  const fetcher = createGraphiQLFetcher({
    url: `${server.location}/v3/${tenant}`,
    // @ts-ignore
    fetch: fetchWithCredentials,
  });

  useEffect(() => {
    if (tenant) {
      axios
        .post(`${server.location}/v3/${tenant}`, {
          query: getIntrospectionQuery(),
        })
        .then(({ data }) => {
          dispatch(setSchema(buildClientSchema(data.data)));
        });
    }
  }, [dispatch, tenant]);

  useEffect(() => {
    if (location.pathname === '/playground') {
      setThemeMode('dark');
    }
    return () => {
      setThemeMode(window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    };
  }, [location, setThemeMode]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName('API'));
    dispatch(setAppActions([]));
    dispatch(setAppLoading(false));
  }, [dispatch]);

  if (!navigator.onLine) {
    return <Offline variant={'centered'} key={0} />;
  }

  return (
    <div style={{ overflow: 'hidden', height: '100%' }}>
      <PageHead
        title={'API Playground'}
        buttons={
          <>
            <Button
              onClick={() => graphiqlRef.current?.handlePrettifyQuery()}
              data-tip={'Prettify Query (Shift-Ctrl-P)'}
            >
              Prettify
            </Button>
            <Button onClick={() => graphiqlRef.current?.handleToggleDocs()} data-tip={'Toggle Docs'}>
              Docs
            </Button>
            <Button
              onClick={() => graphiqlRef.current?.handleEditorRunQuery()}
              data-tip={'Execute Query (Ctrl-Enter)'}
            >
              Execute
            </Button>
          </>
        }
      />
      <div
        className={'graphiql-container'}
        css={css`
          .graphiql-container .topBarWrap {
            display: none;
          }

          .CodeMirror,
          .CodeMirror-gutters,
          .graphiql-container .resultWrap,
          .result-window .CodeMirror.cm-s-graphiql {
            background: transparent;
            border-color: transparent;
          }

          .graphiql-container .result-window .CodeMirror-gutters {
            background: none;
            border-left: 1px solid ${theme.color.neutral.dark[200]};
            border-right: 1px solid ${theme.color.neutral.dark[200]};
          }

          .cm-keyword {
            color: #c678dd;
          }
          .cm-property,
          .cm-def {
            color: #e06c75;
          }
          .cm-attribute {
            color: #abb2bf;
          }
          .cm-string {
            color: #98c379;
          }
          .cm-punctuation {
            color: #999999;
          }
          .CodeMirror-selected {
            background: #343434;
          }
          .CodeMirror-focused .CodeMirror-selected {
            background: #1e2e3e;
          }
          .CodeMirror .CodeMirror-cursor {
            border-color: #e0e0e0 !important;
          }

          .CodeMirror pre {
            font-family: 'Dank Mono', monospace;
            font-size: 14px;

            &.CodeMirror-line {
              padding-top: 1px;
            }
          }

          /* hint box */
          .CodeMirror-hints {
            background-color: ${theme.color.neutral.dark[100]};
            border: 1px solid ${theme.color.neutral.dark[200]};
            min-width: 200px;

            .CodeMirror-hint {
              padding: 3px 8px;
              color: ${theme.color.neutral.dark[1200]};
              border-color: transparent;
            }
            li.CodeMirror-hint-active,
            .CodeMirror-hint:hover {
              background-color: ${theme.color.neutral.dark[200]};
              border-color: transparent;
            }
          }

          /* tabs */
          .graphiql-container .secondary-editor-title,
          .graphiql-container .tabs {
            display: flex;
            flex-direction: row;
            background: none;
            padding: 0;
            height: unset;
            border-top: 1px solid ${theme.color.neutral.dark[200]};
            border-bottom: 1px solid ${theme.color.neutral.dark[200]};

            .variable-editor-title-text,
            button.tab {
              display: flex;
              align-items: center;
              flex-direction: row;
              background: none;
              border: none;
              border-top: 1px solid transparent;
              border-bottom: 1px solid transparent;
              border-right: 1px solid ${theme.color.neutral.dark[200]};
              height: 35px;
              padding: 0 25px;
              margin: 0 !important;
              font-family: ${theme.font.detail};
              font-size: 13px;
              font-weight: 400;
              text-transform: capitalize;
              font-variant-caps: normal;
              letter-spacing: 0;
              color: ${theme.color.neutral.dark[800]};
            }

            .variable-editor-title-text.active,
            button.tab.active {
              color: ${theme.color.neutral.dark[1400]};
              border-bottom: 1px solid ${theme.color.primary[400]};
            }

            button.tab {
              text-transform: none;
              &:hover {
                .close {
                  visibility: visible;
                  &:hover {
                    background-color: ${Color(theme.color.neutral.dark[300]).alpha(0.3).string()};
                  }
                }
              }
              .close {
                visibility: hidden;
                padding: 1px 4px;
                border-radius: ${theme.radius};
                position: absolute;
                right: 3px;
              }
              .close::before {
                color: ${theme.color.neutral.dark[600]};
              }
            }
          }

          button.tab-add {
            visibility: visible;
            color: ${theme.color.neutral.dark[600]};
            border-radius: 0;
            width: 35px;
            height: 35px;
            margin: 0;
            &:hover {
              background-color: ${Color(theme.color.neutral.dark[300]).alpha(0.3).string()};
            }
          }

          .graphiql-container .tabs {
            border-top: none;
          }

          /* documentation explorer */
          .graphiql-container {
            .docExplorerWrap,
            .doc-explorer,
            .doc-explorer-contents {
              background-color: ${theme.color.neutral.dark[100]};
              color: ${theme.color.neutral.dark[1400]};
            }

            .doc-explorer-title {
              font-size: 16px;
              font-family: ${theme.font.headline};
              height: 48px;
            }

            button.docExplorerHide {
              visibility: visible;
              color: ${theme.color.neutral.dark[600]};
              border-radius: 0;
              width: 35px;
              height: 35px;
              margin: -2px;
              padding: 10px;
              &:hover {
                background-color: ${Color(theme.color.neutral.dark[300]).alpha(0.3).string()};
              }
            }

            .doc-explorer-contents {
              border-top: 1px solid ${theme.color.neutral.dark[200]};
            }

            .doc-category-title {
              color: ${theme.color.neutral.dark[1100]};
              border-bottom: 1px solid ${theme.color.neutral.dark[200]};
              font-family: ${theme.font.detail};
              font-weight: 600;
              letter-spacing: 2px;
            }

            .search-box {
              border-bottom: 1px solid ${theme.color.neutral.dark[200]};
              .search-box-clear {
                color: ${theme.color.neutral.dark[1400]};
                background-color: ${theme.color.neutral.dark[400]};
              }
            }

            .doc-explorer-back {
              color: #61afef;
            }

            .keyword {
              font-family: monospace;
              color: #e06c75;
            }

            .type-name {
              font-family: monospace;
              color: #e5c07b;
            }

            .field-name {
              font-family: monospace;
              color: #61afef;
            }

            .arg-name {
              font-family: monospace;
              color: #c678dd;
            }

            .field-short-description {
              color: ${theme.color.neutral.dark[1200]};
            }

            input {
              background-color: ${theme.color.neutral.dark[100]};
              color: ${theme.color.neutral.dark[1400]};
            }
          }
        `}
      >
        <GraphiQL
          ref={graphiqlRef}
          fetcher={fetcher}
          schema={state.schema}
          query={state.query}
          onEditQuery={(query) => dispatch(setQuery(query))}
          defaultQuery={defaultQuery}
          defaultVariableEditorOpen={true}
          tabs={{
            onTabChange: () => {
              if (graphiqlRef.current) {
                dispatch(setQuery(graphiqlRef.current.state.query));
              }
            },
          }}
        >
          <GraphiQL.Toolbar />
        </GraphiQL>
      </div>
    </div>
  );
}

export { Playground };
