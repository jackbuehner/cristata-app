import styled from '@emotion/styled/macro';
import { Editor } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { EditorContent, JSONContent } from '@tiptap/react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { CollaborativeFieldProps } from '.';
import { colorType } from '../../utils/theme/theme';
import { Field } from '../ContentField/Field';
import { useTipTapEditor } from '../Tiptap/hooks';

interface CollaborativeTextFieldProps extends CollaborativeFieldProps {
  defaultValue?: string;
  onChange?: (content: JSONContent[], text: string) => void;
  onDebouncedChange?: (content: JSONContent[], text: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

function CollaborativeTextField(props: CollaborativeTextFieldProps) {
  const { y, defaultValue, onChange, onDebouncedChange, onKeyDown, ...labelProps } = props;

  // create the editor
  const editor = useTipTapEditor({
    document: props.y.ydoc,
    provider: props.y.provider,
    editable: !props.disabled,
    extensions: [
      ParagraphDocument,
      Paragraph,
      Text,
      Collaboration.configure({
        document: props.y.ydoc,
        field: props.y.field,
      }),
      CollaborationCursor.configure({
        provider: props.y.provider,
        user: {
          name: props.y.user.name,
          color: props.y.user.color,
          sessionId: props.y.user.sessionId,
          photo: props.y.user.photo,
        },
      }),
    ],
    onUpdate({ editor }) {
      onUpdate(editor);
      onUpdateDelayed(editor);
    },
    editorProps: {
      handleKeyDown(view, event) {
        onKeyDown?.(event);
        return false;
      },
    },
  });

  // create an update function
  const onUpdate = (editor: Editor) => {
    if (props.onChange) {
      const content = editor.getJSON().content;
      const text = editor.getText();

      props.onChange(content || [], text || '');
    }
  };

  // create a debounced update function
  const onUpdateDelayed = AwesomeDebouncePromise(async (editor: Editor) => {
    if (props.onDebouncedChange) {
      const content = editor.getJSON().content;
      const text = editor.getText();

      props.onDebouncedChange(content || [], text || '');
    }
  }, 1000);

  // replace the content with default content if the field is empty in the ydoc
  if (props.defaultValue && editor && !editor.getText()) {
    editor.commands.setContent(props.defaultValue);
  }

  if (props.label) {
    return (
      <Field {...labelProps} label={props.label}>
        <Content editor={editor} color={props.color} />
      </Field>
    );
  }

  return <Content editor={editor} color={props.color} />;
}

const ParagraphDocument = Document.extend({
  content: 'paragraph',
});

const Content = styled(EditorContent)<{ color?: colorType }>`
  width: 100%;
  box-sizing: border-box;
  .ProseMirror {
    width: 100%;
    padding: 10px 8px;
    line-height: 16px;
    background-color: transparent;
    color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
    box-sizing: border-box;
    border-radius: ${({ theme }) => theme.radius};
    border: none;
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
    transition: box-shadow 240ms;
    font-family: ${({ theme }) => theme.font['detail']};
    font-size: 14px;
    font-variant-numeric: lining-nums;
    &:hover {
      box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
    }
    &:focus {
      outline: none;
      box-shadow: ${({ theme, color }) => {
          if (color === 'neutral') color = undefined;
          return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
        }}
        0px 0px 0px 2px inset;
    }
    p {
      margin: 0;
    }
  }
`;

export { CollaborativeTextField };
