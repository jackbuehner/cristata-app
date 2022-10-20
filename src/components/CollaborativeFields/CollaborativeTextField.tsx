import styled from '@emotion/styled/macro';
import { Editor } from '@tiptap/core';
import { EditorContent, JSONContent } from '@tiptap/react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { CollaborativeFieldProps, CollaborativeFieldWrapper } from '.';
import { colorType } from '../../utils/theme/theme';
import { useTipTapEditor } from '../Tiptap/hooks';
import { editorExtensions } from './editorExtensions';

interface CollaborativeTextFieldProps extends CollaborativeFieldProps {
  onChange?: (content: JSONContent[], text: string) => void;
  onDebouncedChange?: (content: JSONContent[], text: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

function CollaborativeTextField(props: CollaborativeTextFieldProps) {
  const { y, onChange, onDebouncedChange, onKeyDown, ...labelProps } = props;

  // create the editor
  const editor = useTipTapEditor({
    document: props.y.ydoc,
    field: props.y.field,
    provider: props.y.wsProvider,
    editable: !props.disabled,
    extensions: editorExtensions.text,
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

  if (props.label) {
    return (
      <CollaborativeFieldWrapper {...labelProps} y={y} label={props.label}>
        <Content editor={editor} color={props.color} disabled={props.disabled} />
      </CollaborativeFieldWrapper>
    );
  }

  return <Content editor={editor} color={props.color} disabled={props.disabled} />;
}

const Content = styled(EditorContent)<{ color?: colorType; disabled?: boolean }>`
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
    ${({ theme, color, disabled }) => {
      if (disabled !== true) {
        return `
          &:hover {
            box-shadow: ${theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
          }
          &:focus {
            outline: none;
            box-shadow: ${(() => {
              if (color === 'neutral') color = undefined;
              return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
            })()}
              0px 0px 0px 2px inset;
          }
        `;
      }
      return 'cursor: not-allowed;';
    }}
    p {
      margin: 0;
    }
  }
`;

export { CollaborativeTextField };
