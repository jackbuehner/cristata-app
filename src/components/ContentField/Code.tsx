import styled from '@emotion/styled/macro';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useRef } from 'react';
import { cristataCodeDarkTheme } from '../../pages/configuration/cristataCodeDarkTheme';
import { colorType } from '../../utils/theme/theme';
import { Field, FieldProps } from './Field';

interface TextProps extends Omit<FieldProps, 'children'> {
  type: 'json';
  value: string;
  onValidate?: (markers: editor.IMarker[]) => void;
  onChange?: (value: string | undefined) => void;
  height?: number;
}

function Code(props: TextProps) {
  // make editor and monaco available to any function
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  /**
   * Actions to do before the monaco editor renders.
   */
  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('cristata-code-dark', cristataCodeDarkTheme);
    // monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    //   validate: true,
    //   allowComments: false,
    //   comments: 'error',
    //   trailingCommas: 'error',
    //   schemas: [
    //     {
    //       uri: 'collection-schema',
    //       fileMatch: ['/configuration/schema/*.json'], // associate with collection schemas
    //       schema: collectionSchema,
    //     },
    //   ],
    // });
  };

  return (
    <Field
      label={props.label}
      description={props.description}
      color={props.color}
      font={props.font}
      isEmbedded={props.isEmbedded}
    >
      <EditorComponent
        color={props.color}
        height={props.height || 300}
        language={`json`}
        value={props.value}
        options={{ tabSize: 2, theme: 'cristata-code-dark' }}
        beforeMount={handleBeforeMount}
        path={window.location.pathname + '.json'}
        onMount={(editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
          monaco.editor.setTheme('cristata-code-dark');
        }}
        onValidate={props.onValidate}
        onChange={props.onChange}
      />
    </Field>
  );
}

const EditorComponent = styled(Editor)<{
  color?: colorType;
  height: number;
}>`
  height: ${({ height }) => height}px;
  padding: 2px;
  border-radius: ${({ theme }) => theme.radius};
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus-within {
    outline: none;
    box-shadow: ${({ theme, color }) => {
        if (color === 'neutral') color = undefined;
        return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
      }}
      0px 0px 0px 2px inset;
  }
`;

export { Code };