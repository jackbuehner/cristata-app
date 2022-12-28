import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ChevronDown24Regular,
  ChevronUp24Regular,
  Dismiss24Regular,
  ReOrderDotsHorizontal24Regular,
} from '@fluentui/react-icons';
import Color from 'color';
import { DateTime } from 'luxon';
import { merge } from 'merge-anything';
import { get as getProperty } from 'object-path';
import React, { FunctionComponentElement, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDragHandleProps,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';
import { CollaborativeFieldProps, CollaborativeFieldWrapper } from '.';
import { DeconstructedSchemaDefType } from '../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import { colorType, themeType } from '../../utils/theme/theme';
import { Button, buttonEffect } from '../Button';

interface CollaborativeDocArrayProps extends CollaborativeFieldProps {
  stateFieldKey: string;
  schemaDefs: DeconstructedSchemaDefType;
  processSchemaDef: (schemaDef: DeconstructedSchemaDefType) => DeconstructedSchemaDefType;
  renderFields: (
    input: DeconstructedSchemaDefType[0],
    index: number,
    arr: DeconstructedSchemaDefType,
    inArrayKey?: string,
    yjsDocArrayConfig?: { __uuid: string; parentKey: string; childKey: string }
  ) => JSX.Element;
  onChange?: (newValues: unknown[]) => void;
}

function CollaborativeDocArray(props: CollaborativeDocArrayProps) {
  const { y, onChange } = props;
  const yarray = y.ydoc?.getArray<Record<string, unknown>>(props.y.field);

  const theme = useTheme() as themeType;

  // keep track of the array values in the shared type
  const [arr, setArr] = useState<Record<string, unknown>[]>(yarray?.toArray() || []);
  useEffect(() => {
    if (yarray) {
      setArr(yarray.toArray());

      const handleChange = (evt: Y.YArrayEvent<Record<string, unknown>>) => {
        if (evt.changes.delta) {
          setArr(yarray.toArray());

          // send the change to the parent
          onChange?.(yarray.toArray());
        }
      };

      yarray.observe(handleChange);
      return () => {
        yarray.unobserve(handleChange);
      };
    }
  }, [onChange, yarray]);

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const from = result.source.index;
    const to = result.destination?.index;
    const items = yarray?.toArray();
    if (from !== undefined && to !== undefined && yarray && items && !props.disabled) {
      props.y.ydoc?.transact(() => {
        // remove from existing location
        yarray.delete(from);

        // add to new location
        yarray.insert(to, [items[from]]);
      });
    }
  };

  const addDoc = () => {
    const keysToAdd = props
      .processSchemaDef(props.schemaDefs)
      .map(([key, def]) => key.replace(props.stateFieldKey + '.', ''))
      .filter((key) => key[0] !== '#');

    const newEmptyDoc: Record<string, unknown> = merge(
      { __uuid: uuidv4() },
      ...keysToAdd.map((key) => ({ [key]: undefined }))
    );

    props.y.ydoc?.transact(() => {
      yarray?.push([newEmptyDoc]);
    });
  };

  const docFieldGroups: FunctionComponentElement<Record<string, unknown>>[][] = arr.map(({ __uuid }) => {
    const groupFields = props.processSchemaDef(props.schemaDefs).map(([subkey, subdef], index, arr) => {
      const fieldElem = props.renderFields(
        [subkey.replace(props.stateFieldKey, `${props.stateFieldKey}`), subdef],
        index,
        arr,
        props.stateFieldKey,
        // doc array options for yjs
        {
          __uuid: __uuid as string, // identify sub fields by uuid
          parentKey: props.stateFieldKey, // the key of the doc array that contains the doc
          childKey: subkey.replace(props.stateFieldKey + '.', ''),
        }
      );

      return React.cloneElement(fieldElem, { isEmbedded: true });
    });

    return groupFields;
  });

  return (
    <CollaborativeFieldWrapper
      label={props.label || ''}
      disabled={props.disabled}
      description={props.description}
      font={props.font}
      color={props.color}
      y={y}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`subdocarray-${props.stateFieldKey}`} direction={'vertical'}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <>
                {docFieldGroups.map((group, index) => {
                  const isCollasped = getProperty(arr, `${index}.__collapsed`) === true;
                  const uuid: string = getProperty(arr, `${index}.__uuid`);
                  const childrenYjsFieldKeys = group
                    .map(({ props }) => getProperty(props, 'y.field'))
                    .filter((key) => !!key);
                  const collapsedContentRows = group
                    .map(({ props }) => {
                      const y = props.y as CollaborativeDocArrayProps['y'] | undefined;

                      const label =
                        typeof getProperty(props, 'label') === 'string'
                          ? (getProperty(props, 'label') as string)
                          : undefined;

                      let value = (y?.ydoc?.toJSON() || {})[y?.field || ''] || '';
                      if (Array.isArray(value)) value = `${value.length} items`;
                      if (typeof value !== 'string') value = '';
                      value = value.replace(/<.*?>/g, '');

                      if (label && value) {
                        // convert value to formatted date if it is a ISO string
                        if (typeof value === 'string' && DateTime.fromISO(value).isValid)
                          value = DateTime.fromISO(value).toLocaleString({
                            ...DateTime.DATETIME_HUGE,
                            timeZoneName: 'short',
                          });
                      }

                      if (label) {
                        return { label, value };
                      }

                      return null;
                    })
                    .filter(
                      (
                        _
                      ): _ is {
                        label: string;
                        value: string | number;
                      } => !!_
                    );
                  return (
                    <Draggable draggableId={uuid} index={index} key={index + uuid}>
                      {(provided) => (
                        <Group key={uuid} theme={theme} ref={provided.innerRef} {...provided.draggableProps}>
                          <DragHandle dragHandleProps={provided.dragHandleProps} disabled={props.disabled} />
                          {isCollasped ? (
                            <GroupContent>
                              {collapsedContentRows.map(({ label, value }, index) => {
                                return (
                                  <FieldGroup theme={theme} key={index}>
                                    <FieldName theme={theme}>{label}</FieldName>
                                    <FieldValue>{value.toString()}</FieldValue>
                                  </FieldGroup>
                                );
                              })}
                            </GroupContent>
                          ) : (
                            <GroupContent>{group}</GroupContent>
                          )}
                          <IconGroup theme={theme}>
                            <IconWrapper
                              theme={theme}
                              color={'red'}
                              disabled={props.disabled}
                              onClick={() => {
                                if (!props.disabled) {
                                  yarray?.delete(index, 1);

                                  childrenYjsFieldKeys.forEach((key) => {
                                    if (props.y.ydoc?.share.has(key)) {
                                      props.y.ydoc?.share.delete(key);
                                    }
                                  });
                                }
                              }}
                            >
                              <Dismiss24Regular />
                            </IconWrapper>
                            {isCollasped ? (
                              <IconWrapper
                                theme={theme}
                                color={props.color || 'primary'}
                                disabled={props.disabled}
                                onClick={() => {
                                  if (!props.disabled) {
                                    const { __collapsed, ...rest } = arr[index];
                                    y.ydoc?.transact(() => {
                                      yarray?.delete(index); // remove existing value
                                      yarray?.insert(index, [rest]); // add the value back but not collapse
                                    });
                                  }
                                }}
                              >
                                <ChevronDown24Regular />
                              </IconWrapper>
                            ) : (
                              <IconWrapper
                                theme={theme}
                                color={props.color || 'primary'}
                                disabled={props.disabled}
                                onClick={() => {
                                  if (!props.disabled) {
                                    y.ydoc?.transact(() => {
                                      yarray?.delete(index); // remove existing value
                                      yarray?.insert(index, [{ ...arr[index], __collapsed: true }]); // add the value back but not collapse
                                    });
                                  }
                                }}
                              >
                                <ChevronUp24Regular />
                              </IconWrapper>
                            )}
                          </IconGroup>
                        </Group>
                      )}
                    </Draggable>
                  );
                })}
                <Button onClick={addDoc} height={`28px`} width={`100%`} disabled={props.disabled}>
                  Add document
                </Button>
              </>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </CollaborativeFieldWrapper>
  );
}

const Group = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 6px;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.2).string()};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  overflow: hidden;
`;

const FieldGroup = styled.div<{ theme: themeType }>`
  line-height: 16px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  margin: 2px 0;
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const FieldName = styled.span<{ theme: themeType }>`
  font-weight: 500;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  white-space: nowrap;
`;

const FieldValue = styled.span`
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GroupContent = styled.div`
  flex-grow: 1;
  padding: 10px;
  width: 0;
`;

const IconGroup = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 0;
  flex-shrink: 0;
  > span {
    border: none !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 0;
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
  }
`;

function DragHandle(props: { dragHandleProps?: DraggableProvidedDragHandleProps; disabled?: boolean }) {
  return (
    <DragHandleComponent {...props.dragHandleProps} style={props.disabled ? { display: 'none' } : undefined}>
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

export { CollaborativeDocArray };
