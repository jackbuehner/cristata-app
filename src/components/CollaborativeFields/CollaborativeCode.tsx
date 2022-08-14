import styled from '@emotion/styled/macro';
import { useMonaco } from '@monaco-editor/react';
import Color from 'color';
import { editor } from 'monaco-editor';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { Remark } from 'react-remark';
import { MonacoBinding } from 'y-monaco';
import { YTextEvent } from 'yjs';
import { CollaborativeFieldProps, CollaborativeFieldWrapper } from '.';
import { cristataCodeDarkTheme } from '../../pages/configuration/cristataCodeDarkTheme';
import { colorType } from '../../utils/theme/theme';
import { Tab, TabBar } from '../Tabs';
import { useAwareness } from '../Tiptap/hooks';
import utils from './utils';

interface CollaborativeCodeProps extends CollaborativeFieldProps {
  type: 'json' | 'md';
  onValidate?: (markers: editor.IMarker[]) => void;
  onChange?: (value: string | undefined) => void;
  height?: number;
}

function CollaborativeCode(props: CollaborativeCodeProps) {
  const { y, type: language, onChange, onValidate, height, ...labelProps } = props;
  const ySharedType = y.ydoc?.getText(y.field);

  const [tabIndex, setTabIndex] = useState<number>(0);

  const node = useRef<HTMLDivElement | null>(null);
  const monaco = useMonaco();

  const [model, setModel] = useState<editor.ITextModel | null>(null);
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);

  // create the editor with the default value
  useEffect(() => {
    if (monaco && node.current !== null && editor === null) {
      const el = node.current;
      monaco.editor.defineTheme('cristata-code-dark', cristataCodeDarkTheme);
      setModel(monaco.editor.createModel('', language, undefined));
      setEditor(monaco.editor.create(el, { theme: 'cristata-code-dark' }));
    }
  }, [language, monaco, editor]);

  // bind yjs to the monaco editor
  useEffect(() => {
    if (editor && model && binding === null && y.provider && ySharedType) {
      editor.setModel(model);
      setBinding(new MonacoBinding(ySharedType, model, new Set([editor]), y.provider.awareness));
    }
  }, [binding, editor, model, y.provider, ySharedType]);

  // send changes to parent when yjs shared type changes
  const [value, setValue] = useState('');
  useEffect(() => {
    const handleChange = (evt: YTextEvent) => {
      const text = evt.target.toJSON();
      setValue(text);
      onChange?.(text);
    };
    ySharedType?.observe(handleChange);
    return () => {
      ySharedType?.unobserve(handleChange);
    };
  });

  useEffect(() => {
    if (editor) {
      const handleKeyDown = () => {
        utils.setUnsaved(props.y.ydoc, props.y.field.split('‾‾')[1] || props.y.field);
      };
      editor.onKeyDown(handleKeyDown);
    }
  }, [editor, props.y.field, props.y.ydoc]);

  const awareness = y.provider?.awareness;
  const [awarenessProfiles, setAwarenessProfiles] = useState<AwarenessProfiles>();
  useEffect(() => {
    if (awareness) {
      const handleChange = () => {
        setAwarenessProfiles(Array.from(awareness.getStates().entries()) as AwarenessProfiles);
      };
      awareness.on('change', handleChange);
      return () => {
        awareness.off('change', handleChange);
      };
    }
  });

  const Component = (
    <>
      {props.type === 'md' ? (
        <TabBar
          activeTabIndex={tabIndex}
          onActivate={(evt: { detail: { index: SetStateAction<number> } }) => setTabIndex(evt.detail.index)}
        >
          <Tab>Compose</Tab>
          <Tab>Preview</Tab>
        </TabBar>
      ) : null}
      <EditorComponent
        ref={node}
        color={props.color}
        height={props.height || 300}
        tabIndex={tabIndex}
        awarenessProfiles={awarenessProfiles || []}
      />
      {tabIndex === 1 ? (
        <MdPreview color={props.color} height={props.height || 300}>
          <Remark>{value}</Remark>
        </MdPreview>
      ) : null}
    </>
  );

  if (props.label) {
    return (
      <CollaborativeFieldWrapper {...labelProps} y={y} label={props.label}>
        {Component}
      </CollaborativeFieldWrapper>
    );
  }

  return Component;
}

const EditorComponent = styled.div<{
  color?: colorType;
  height: number;
  tabIndex: number;
  awarenessProfiles: AwarenessProfiles;
}>`
  display: ${({ tabIndex }) => (tabIndex === 0 ? 'block' : 'none')};
  height: ${({ height }) => height}px;
  padding: 2px;
  border-radius: ${({ theme }) => theme.radius};
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  box-sizing: border-box;
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
  > *,
  .overflow-guard {
    max-height: ${({ height }) => height - 4}px !important;
  }

  ${({ awarenessProfiles, theme }) => {
    return awarenessProfiles.map(([clientId, profile]) => {
      console.log(clientId, profile.user);
      return `
        .yRemoteSelection-${clientId} {
          background-color: ${Color(profile.user.color || 'orange')
            .alpha(0.5)
            .string()};
        }
        .yRemoteSelectionHead-${clientId} {
          position: absolute;
          border-left: ${profile.user.color || 'orange'} solid 2px;
          border-top: ${profile.user.color || 'orange'} solid 2px;
          border-bottom: ${profile.user.color || 'orange'} solid 2px;
          height: 100%;
          box-sizing: border-box;
        }
        .yRemoteSelectionHead-${clientId}::after {
          position: absolute;
          content: '${profile.user.name}';
          border: 3px solid ${profile.user.color || 'orange'};
          border-radius: 4px;
          left: -4px;
          top: -5px;
          font-size: 0;
          font-style: normal;
          font-weight: 680;
          line-height: normal;
          user-select: none;
          color: ${theme.color.neutral['light'][1500]};
          font-family: ${theme.font.detail};
          height: 0;
          transition: all 0ms, left 200ms, padding 200ms, border-width 200ms;
          transition-delay: 600ms;
          white-space: nowrap;
          background-color: ${profile.user.color || 'orange'};
        }
        .yRemoteSelectionHead-${clientId}:hover::after {
          transition: all 0ms, left 100ms, padding 100ms, border-width 100ms, top 80ms;
          transition-delay: 0ms;
          top: -1.7em;
          left: -2px;
          font-size: 12px;
          height: 15px;
          padding: 0.1rem 0.3rem;
          border-radius: 1px 1px 1px 0;
          border: none;
        }
      `;
    });
  }}
`;

const MdPreview = styled.div<{
  color?: colorType;
  height: number;
}>`
  height: ${({ height }) => height}px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radius};
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  box-sizing: border-box;
`;

type AwarenessProfiles = Array<[number, { user: ReturnType<typeof useAwareness>[0]; [key: string]: any }]>;

export { CollaborativeCode };
