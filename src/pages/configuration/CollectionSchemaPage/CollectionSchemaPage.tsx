import { DocumentNode, gql } from '@apollo/client';
import { ArrowClockwise24Regular, Save24Regular } from '@fluentui/react-icons';
import collectionSchema from '@jackbuehner/cristata-api/dist/json-schemas/collection.schema.json';
import { Collection } from '@jackbuehner/cristata-api/dist/types/config';
import Editor, { Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, IconButton } from '../../../components/Button';
import { PageHead } from '../../../components/PageHead';
import { client } from '../../../graphql/client';
import { cristataCodeDarkTheme } from '../cristataCodeDarkTheme';
import { useGetRawConfig } from './useGetRawConfig';

function CollectionSchemaPage() {
  const location = useLocation();
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHead
        title={'Configure collection'}
        description={collection}
        isLoading={loading}
        buttons={
          <>
            <IconButton
              icon={<ArrowClockwise24Regular />}
              data-tip={`Discard changes and refresh`}
              onClick={() => refetch()}
            />
            <Button
              icon={<Save24Regular />}
              disabled={loading || hasErrors}
              onClick={() => {
                // format on save
                editorRef.current?.trigger('editor', 'editor.action.formatDocument', null);

                // save
                const value = editorRef.current
                  ? (JSON.parse(editorRef.current?.getValue()) as Collection)
                  : undefined;
                if (value) {
                  console.log(saveMutationString(collection, value));
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
              }}
            >
              Save
            </Button>
          </>
        }
      />
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
