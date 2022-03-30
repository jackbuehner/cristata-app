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
import { PageHead } from '../../components/PageHead';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setQuery, setSchema } from '../../redux/slices/graphiqlSlice';
import { theme as themeC, themeType } from '../../utils/theme/theme';

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
  setTheme: Dispatch<SetStateAction<themeType>>;
}

function Playground({ setTheme }: PlaygroundProps) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const state = useAppSelector((state) => state.graphiql);
  const dispatch = useAppDispatch();
  const graphiqlRef = useRef<GraphiQL>(null);

  const fetcher = createGraphiQLFetcher({
    url: `${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/v3`,
    fetch: fetchWithCredentials,
  });

  useEffect(() => {
    axios
      .post(`${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/v3`, {
        query: getIntrospectionQuery(),
      })
      .then(({ data }) => {
        dispatch(setSchema(buildClientSchema(data.data)));
      });
  });

  useEffect(() => {
    if (location.pathname === '/playground') {
      setTheme(themeC('dark'));
    }
    return () => {
      setTheme(themeC(window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    };
  }, [location, setTheme]);

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
            <Button onClick={() => graphiqlRef.current?.handleToggleHistory()} data-tip={'Show History'}>
              History
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
          .secondary-editor-title,
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
          tabs={true}
        >
          <GraphiQL.Toolbar />
        </GraphiQL>
      </div>
    </div>
  );
}

export { Playground };
