/** @jsxImportSource @emotion/react */
import { playground, playgroundActions } from '$stores/playground';
import { css, useTheme } from '@emotion/react';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import Color from 'color';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import { buildClientSchema, getIntrospectionQuery } from 'graphql';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import { useStore } from 'svelte-preprocess-react';
import { useLocation } from 'svelte-preprocess-react/react-router';
import { Offline } from '../../components/Offline';
import { server } from '../../utils/constants';
import type { themeType } from '../../utils/theme/theme';

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

function Playground() {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const $playground = useStore(playground);
  let graphiqlRef: GraphiQL | null = null;

  const tenant = location.pathname.split('/')[1];

  const fetcher = createGraphiQLFetcher({
    url: `${server.location}/v3/${tenant}`,
    // @ts-ignore
    fetch: fetchWithCredentials,
  });

  // get the schema
  useEffect(() => {
    if (tenant) {
      fetch(`${server.location}/v3/${tenant}`, {
        method: 'POST',
        body: JSON.stringify({ query: getIntrospectionQuery() }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => res.json())
        .then(({ data }) => {
          const schema = buildClientSchema(data);
          playground.update(($playground) => {
            return { ...$playground, schema };
          });
        });
    }
  }, [tenant]);

  // set actions in store to they can be accessed in svelte
  function setPlaygroundStore(graphiql: GraphiQL | null) {
    graphiqlRef = graphiql;

    if (graphiql) {
      playgroundActions.update(() => {
        return {
          handlePrettifyQuery: graphiql.handlePrettifyQuery,
          handleToggleDocs: graphiql.handleToggleDocs,
          handleEditorRunQuery: graphiql.handleEditorRunQuery,
        };
      });
    }
  }

  if (!navigator.onLine) {
    return <Offline variant={'centered'} key={0} />;
  }

  return (
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
        ref={(graphiqlRef) => setPlaygroundStore(graphiqlRef)}
        fetcher={fetcher}
        schema={$playground.schema}
        query={$playground.state?.query}
        onEditQuery={(query) => {
          playground.update(($playground) => {
            return {
              ...$playground,
              state: {
                ...$playground.state,
                query,
              },
            };
          });
        }}
        defaultQuery={defaultQuery}
        defaultVariableEditorOpen={true}
        onToggleDocs={(docExplorerOpen) => {
          playground.update(($playground) => {
            return {
              ...$playground,
              state: {
                ...$playground.state,
                docExplorerOpen,
              },
            };
          });
        }}
        tabs={{
          onTabChange: () => {
            if (graphiqlRef) {
              playground.update(($playground) => {
                if (graphiqlRef) {
                  return {
                    ...$playground,
                    state: {
                      ...$playground.state,
                      query: graphiqlRef.state.query,
                    },
                  };
                }
                return $playground;
              });
            }
          },
        }}
      >
        <GraphiQL.Toolbar />
      </GraphiQL>
    </div>
  );
}

export { Playground };
