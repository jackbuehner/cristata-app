import { openWindow } from '$utils/openWindow';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Dismiss24Regular, Open24Regular, ReOrderDotsHorizontal24Regular } from '@fluentui/react-icons';
import Color from 'color';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import type { DraggableProvidedDragHandleProps, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import type * as Y from 'yjs';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { capitalize } from '../../utils/capitalize';
import type { colorType, themeType } from '../../utils/theme/theme';
import { Button, buttonEffect } from '../Button';
import type { EntryY } from '../Tiptap/hooks/useY';
import type { Value } from './CollaborativeCombobox';

interface SelectedReferenceItemsProps {
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  fieldName: string;
  font?: keyof themeType['font'];
  color?: colorType;
  y: Omit<EntryY, 'ydoc'> & { ydoc: Y.Doc };
  /**
   * Singular collection name.
   */
  collection: string;
  noDrag?: boolean;
  many?: false;
  disabled?: boolean;
}

function SelectedReferenceItems(props: SelectedReferenceItemsProps) {
  const theme = useTheme();
  const yarray = props.y.ydoc.getArray<Value<string>>(props.fieldName);
  const forceUpdate = useForceUpdate();
  const tenant = location.pathname.split('/')[1];

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
      {selected.length > 0 && props.many !== false ? (
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
              {selected.map(({ value: _id, label }, index) => {
                return (
                  <Draggable
                    draggableId={_id.toString()}
                    isDragDisabled={props.noDrag || props.disabled}
                    index={index}
                    key={index + _id.toString()}
                  >
                    {(provided) => (
                      <SelectItem ref={provided.innerRef} {...provided.draggableProps} theme={theme}>
                        {props.noDrag ? null : (
                          <DragHandle dragHandleProps={provided.dragHandleProps} disabled={props.disabled} />
                        )}
                        <SelectContent>
                          <SelectText font={props.font}>{label}</SelectText>
                          <SelectText font={props.font}>
                            {capitalize(props.collection)} ID:{' '}
                            {
                              // if the ID is a URL, use everything after the first '/' in the URL (exlcuding the protocol)
                              isURL(_id) ? _id.replace('://', '').split('/')[1] : _id
                            }
                          </SelectText>
                        </SelectContent>
                        <IconWrapper
                          color={props.color || 'primary'}
                          disabled={false}
                          onClick={() => {
                            if (isURL(_id)) {
                              openWindow(_id, props.collection + _id, 'location=no');
                            } else if (props.collection.toLowerCase() === 'user') {
                              openWindow(`/${tenant}/profile/${_id}`, props.collection + _id, 'location=no');
                            } else if (props.collection.toLowerCase() === 'team') {
                              openWindow(`/${tenant}/teams/${_id}`, props.collection + _id, 'location=no');
                            } else if (props.collection.toLowerCase() === 'photo') {
                              openWindow(
                                `/${tenant}/cms/photo/library/${_id}`,
                                props.collection + _id,
                                'location=no'
                              );
                            } else {
                              openWindow(
                                `/${tenant}/cms/collection/${pluralize(props.collection.toLowerCase())}/${_id}`,
                                props.collection + _id,
                                'location=no'
                              );
                            }
                          }}
                        >
                          <Open24Regular />
                        </IconWrapper>
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

function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
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

const SelectContent = styled.div`
  flex-grow: 1;
`;

const SelectText = styled.div<{ font?: keyof themeType['font'] }>`
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  line-height: 16px;
  padding: 0 10px;
  flex-wrap: nowrap;
  word-break: break-word;
  &:first-of-type {
    padding-top: 10px;
  }
  &:last-of-type {
    padding-bottom: 10px;
    font-size: 11px;
    color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
`;

function DragHandle(props: { dragHandleProps?: DraggableProvidedDragHandleProps; disabled?: boolean }) {
  return (
    <DragHandleComponent {...props.dragHandleProps} disabled={props.disabled}>
      <ReOrderDotsHorizontal24Regular />
    </DragHandleComponent>
  );
}

const DragHandleComponent = styled.span<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  min-height: 38px;
  border-right: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  flex-shrink: 0;
  color: ${({ theme, disabled }) =>
    disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1400]};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'default')};
`;

const IconWrapper = styled.span<{ color: colorType; disabled?: boolean }>`
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
  color: ${({ theme, disabled }) =>
    disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1400]};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'default')};
  > svg {
    width: 16px;
    height: 16px;
  }
`;

export { SelectedReferenceItems };
