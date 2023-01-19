import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ChevronDown24Regular,
  ChevronUp24Regular,
  Dismiss24Regular,
  ReOrderDotsHorizontal24Regular
} from '@fluentui/react-icons';
import { arrayMoveImmutable as arrayMove } from 'array-move';
import Color from 'color';
import { DateTime } from 'luxon';
import { merge } from 'merge-anything';
import { get as getProperty } from 'object-path';
import type { FunctionComponentElement } from 'react';
import React from 'react';
import type { DraggableProvidedDragHandleProps, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import type { DeconstructedSchemaDefType } from '../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import type { colorType, themeType } from '../../utils/theme/theme';
import { Button, buttonEffect } from '../Button';
import type { FieldProps } from './Field';
import { Field } from './Field';

interface DocArrayProps extends Omit<FieldProps, 'children'> {
  stateFieldKey: string;
  label: string;
  disabled?: boolean;
  data?: Record<string, unknown>[];
  schemaDefs: DeconstructedSchemaDefType;
  processSchemaDef: (schemaDef: DeconstructedSchemaDefType) => DeconstructedSchemaDefType;
  renderFields: (
    input: DeconstructedSchemaDefType[0],
    index: number,
    arr: DeconstructedSchemaDefType,
    inArrayKey?: string
  ) => JSX.Element;
  onChange?: (newValues: unknown[]) => void;
}

function DocArray(props: DocArrayProps) {
  const theme = useTheme() as themeType;

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const from = result.source.index;
    const to = result.destination?.index;
    if (from !== undefined && to !== undefined && props.data && props.onChange) {
      props.onChange(arrayMove(props.data, from, to));
    }
  };

  const addDoc = () => {
    if (props.onChange) {
      const keysToAdd = props
        .processSchemaDef(props.schemaDefs)
        .map(([key, def]) => key.replace(props.stateFieldKey + '.', ''))
        .filter((key) => key[0] !== '#');

      const newEmptyDoc: Record<string, unknown> = merge({}, ...keysToAdd.map((key) => ({ [key]: undefined })));

      if (props.data) props.onChange([...props.data, newEmptyDoc]);
      else props.onChange([newEmptyDoc]);
    }
  };

  const docFieldGroups: FunctionComponentElement<Record<string, unknown>>[][] = Array.from({
    length: props.data?.length || 0,
  }).map((_, groupIndex) => {
    const groupFields = props.processSchemaDef(props.schemaDefs).map(([subkey, subdef], index, arr) => {
      const fieldElem = props.renderFields(
        [subkey.replace(props.stateFieldKey, `${props.stateFieldKey}.${groupIndex}`), subdef],
        index,
        arr,
        props.stateFieldKey
      );

      return React.cloneElement(fieldElem, { isEmbedded: true });
    });

    return groupFields;
  });

  return (
    <Field
      label={props.label}
      disabled={props.disabled}
      description={props.description}
      font={props.font}
      color={props.color}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`subdocarray-${props.stateFieldKey}`} direction={'vertical'}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <>
                {docFieldGroups.map((group, index) => {
                  const isCollasped = props.data && getProperty(props.data, `${index}.__collapsed`) === true;
                  const collapsedContentRows = group
                    .map(({ props }) => {
                      const label =
                        typeof getProperty(props, 'label') === 'string'
                          ? (getProperty(props, 'label') as string)
                          : undefined;
                      let value =
                        typeof getProperty(props, 'value') === 'string'
                          ? (getProperty(props, 'value') as string)
                          : typeof getProperty(props, 'value') === 'number'
                          ? (getProperty(props, 'value') as number)
                          : undefined;

                      if (label && value) {
                        // convert value to formatted date if it is a ISO string
                        if (typeof value === 'string' && DateTime.fromISO(value).isValid)
                          value = DateTime.fromISO(value).toLocaleString({
                            ...DateTime.DATETIME_HUGE,
                            timeZoneName: 'short',
                          });

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
                    <Draggable draggableId={`${index}`} index={index} key={index}>
                      {(provided) => (
                        <Group key={index} theme={theme} ref={provided.innerRef} {...provided.draggableProps}>
                          <DragHandle dragHandleProps={provided.dragHandleProps} />
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
                                if (props.data && props.onChange) {
                                  props.onChange([
                                    ...props.data.slice(0, index),
                                    ...props.data.slice(index + 1),
                                  ]);
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
                                  if (props.data && props.onChange) {
                                    const { __collapsed, ...rest } = props.data[index];
                                    props.onChange([
                                      ...props.data.slice(0, index),
                                      { ...rest },
                                      ...props.data.slice(index + 1),
                                    ]);
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
                                  if (props.data && props.onChange) {
                                    props.onChange([
                                      ...props.data.slice(0, index),
                                      {
                                        ...props.data[index],
                                        __collapsed: true,
                                      },
                                      ...props.data.slice(index + 1),
                                    ]);
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
                <Button onClick={addDoc} height={`28px`} width={`100%`}>
                  Add document
                </Button>
              </>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Field>
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

export { DocArray };
