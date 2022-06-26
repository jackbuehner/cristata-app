import { DocumentNode, gql, useApolloClient } from '@apollo/client';
import collectionSchema from '@jackbuehner/cristata-api/dist/json-schemas/collection.schema.json';
import { Collection } from '@jackbuehner/cristata-api/dist/types/config';
import Editor, { Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Offline } from '../../../components/Offline';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { cristataCodeDarkTheme } from '../cristataCodeDarkTheme';
import { useGetRawConfig } from './useGetRawConfig';

function CollectionSchemaPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const client = useApolloClient();
  const { collection } = useParams() as { collection: string };
  const [raw, loadingInitial, error, refetch] = useGetRawConfig(collection);
  const json = JSON.stringify(raw, null, 2);
  const [hasErrors, setHasErrors] = useState(false);
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(loadingInitial);
  }, [loadingInitial]);

  useEffect(() => {
    if (json && loadingInitial === false) editorRef.current?.setValue(json);
  }, [json, loadingInitial]);

  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('cristata-code-dark', cristataCodeDarkTheme);

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      comments: 'error',
      trailingCommas: 'error',
      schemas: [
        {
          uri: 'collection-schema',
          fileMatch: ['/configuration/schema/*.json'], // associate with collection schemas
          schema: collectionSchema,
        },
      ],
    });
  };

  // keep loading state synced
  useEffect(() => {
    dispatch(setAppLoading(loading));
  }, [dispatch, loading]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName('Configure collection'));
    dispatch(
      setAppActions([
        {
          label: 'Refresh data',
          type: 'icon',
          icon: 'ArrowClockwise24Regular',
          action: () => refetch(),
          'data-tip': `Discard changes and refresh`,
        },
        {
          label: 'Save',
          type: 'button',
          icon: 'Save24Regular',
          action: () => {
            // format on save
            editorRef.current?.trigger('editor', 'editor.action.formatDocument', null);

            // save
            const value = editorRef.current
              ? (JSON.parse(editorRef.current?.getValue()) as Collection & { skipAdditionalParsing?: boolean })
              : undefined;

            if (value) {
              // tell the server to not parse objectIds and dates (leave them as strings)
              value.skipAdditionalParsing = true;

              // send the mutation
              setLoading(true);
              client
                .mutate<SaveMutationType>({ mutation: saveMutationString(collection, value) })
                .finally(() => {
                  setLoading(false);
                })
                .then(({ data }) => {
                  if (data?.setRawConfigurationCollection) {
                    editorRef.current?.setValue(
                      JSON.stringify(JSON.parse(data.setRawConfigurationCollection), null, 2)
                    );
                  }
                })
                .catch((error) => {
                  console.error(error);
                  toast.error(`Failed to save. \n ${error.message}`);
                  return false;
                });
            }
          },
          disabled: hasErrors,
        },
      ])
    );
  }, [client, collection, dispatch, hasErrors, refetch]);

  if (!raw && !navigator.onLine) {
    return <Offline variant={'centered'} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {raw ? (
        <Editor
          defaultLanguage={`json`}
          language={`json`}
          defaultValue={json}
          options={{ tabSize: 2, theme: 'cristata-code-dark' }}
          beforeMount={handleBeforeMount}
          path={location.pathname + '.json'}
          onMount={(editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;
            monaco.editor.setTheme('cristata-code-dark');
          }}
          onValidate={(markers: editor.IMarker[]) => {
            setHasErrors(markers.length > 0);
          }}
          onChange={(value) => {}}
        />
      ) : error ? (
        <pre>{JSON.stringify(error, null, 2)}</pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

interface SaveMutationType {
  setRawConfigurationCollection?: string | null;
}

function saveMutationString(name: string, raw: Collection): DocumentNode {
  return gql`
    mutation {
      setRawConfigurationCollection(name: "${name}", raw: ${JSON.stringify(`${JSON.stringify(raw)}`)})
    }
  `;
}

export { CollectionSchemaPage };
