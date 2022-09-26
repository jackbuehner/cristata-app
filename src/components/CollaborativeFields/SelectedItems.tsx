import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Dismiss24Regular, ReOrderDotsHorizontal24Regular } from '@fluentui/react-icons';
import Color from 'color';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDragHandleProps,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import * as Y from 'yjs';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { colorType, themeType } from '../../utils/theme/theme';
import { Button, buttonEffect } from '../Button';
import { EntryY } from '../Tiptap/hooks/useY';
import { Value } from './CollaborativeCombobox';

interface SelectedItemsProps {
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  fieldName: string;
  font?: keyof themeType['font'];
  color?: colorType;
  y: Omit<EntryY, 'ydoc'> & { ydoc: Y.Doc };
  noDrag?: boolean;
  disabled?: boolean;
}

function SelectedItems(props: SelectedItemsProps) {
  const theme = useTheme();
  const yarray = props.y.ydoc.getArray<Value<string>>(props.fieldName);
  const forceUpdate = useForceUpdate();

  // keep track of the selected values shared type
  const [selected, setSelected] = useState<Value<string>[]>(yarray?.toArray() || []);
  useEffect(() => {
    if (yarray) {
      if (selected.length !== yarray.toArray().length) {
        setSelected(yarray.toArray());
      }

      const handleChange = (evt: Y.YArrayEvent<Value<string>>) => {
        if (evt.changes.delta) {
          setSelected(yarray.toArray());

          // rerender the component
          forceUpdate();
        }
      };

      yarray.observe(handleChange);
      return () => {
        yarray.unobserve(handleChange);
      };
    }
  }, [forceUpdate, selected.length, yarray]);

  return (
    <>
      {selected.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 6, padding: '12px 0 6px 0' }}>
          <Button
            disabled={props.disabled}
            cssExtra={css`
              min-width: unset;
            `}
            height={26}
            border={{ base: '1px solid transparent' }}
            backgroundColor={{
              base:
                theme.mode === 'dark' ? Color(theme.color.neutral.dark[100]).lighten(0.4).string() : undefined,
            }}
            onClick={() => {
              props.y.ydoc.transact(() => {
                yarray.delete(0, yarray.length);
              });
            }}
          >
            Clear all
          </Button>
        </div>
      ) : null}
      <DragDropContext onDragEnd={props.onDragEnd}>
        <Droppable droppableId={`selectMany-${props.fieldName}`} direction={'vertical'}>
          {(provided) => (
            <DragZone ref={provided.innerRef} {...provided.droppableProps}>
              {selected.map(({ value, label }, index) => {
                return (
                  <Draggable draggableId={value.toString()} index={index} key={index + value.toString()}>
                    {(provided) => (
                      <SelectItem ref={provided.innerRef} {...provided.draggableProps}>
                        {props.noDrag || props.disabled ? null : (
                          <DragHandle dragHandleProps={provided.dragHandleProps} />
                        )}
                        <SelectText theme={theme} font={props.font}>
                          {label}
                        </SelectText>
                        <IconWrapper
                          theme={theme}
                          color={props.color || 'primary'}
                          disabled={props.disabled}
                          onClick={() => {
                            props.y.ydoc.transact(() => {
                              if (!props.disabled) {
                                yarray.delete(index);
                              }
                            });
                          }}
                        >
                          <Dismiss24Regular />
                        </IconWrapper>
                      </SelectItem>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </DragZone>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}

const DragZone = styled.div`
  display: flex;
  flex-direction: column;
`;

const SelectItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 6px;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const SelectText = styled.div<{ font?: keyof themeType['font'] }>`
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  line-height: 16px;
  padding: 10px;
  flex-wrap: nowrap;
  flex-grow: 1;
  word-break: break-word;
`;

function DragHandle(props: { dragHandleProps?: DraggableProvidedDragHandleProps }) {
  return (
    <DragHandleComponent {...props.dragHandleProps}>
      <ReOrderDotsHorizontal24Regular />
    </DragHandleComponent>
  );
}

const DragHandleComponent = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  min-height: 38px;
  border-right: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  flex-shrink: 0;
`;

const IconWrapper = styled.span<{ theme: themeType; color: colorType; disabled?: boolean }>`
  ${({ color, theme, disabled }) =>
    buttonEffect(color, theme.mode === 'light' ? 700 : 300, theme, disabled, { base: 'transparent' })}
  border: none !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  justify-content: center;
  width: 34px;
  min-height: 36px;
  margin: 0 1px 0 0;
  border-left: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  border-radius: ${({ theme }) => theme.radius};
  > svg {
    width: 16px;
    height: 16px;
  }
`;

export { SelectedItems };
