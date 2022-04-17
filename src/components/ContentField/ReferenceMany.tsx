import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Dismiss24Regular, Open24Regular, ReOrderDotsHorizontal24Regular } from '@fluentui/react-icons';
import { FieldDef } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import { arrayMoveImmutable as arrayMove } from 'array-move';
import Color from 'color';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { Combobox } from '.';
import { capitalize } from '../../utils/capitalize';
import { colorType, themeType } from '../../utils/theme/theme';
import { Button, buttonEffect } from '../Button';
import { Field, FieldProps } from './Field';
import { populateReferenceValues } from './populateReferenceValues';
import { useOptions } from './useOptions';

interface ReferenceManyProps extends Omit<FieldProps, 'children'> {
  values: UnpopulatedValue[];
  onChange?: (newValues: PopulatedValue[]) => void;
  disabled?: boolean;
  /**
   * Singular collection name.
   */
  collection: string;
  reference?: FieldDef['reference'];
  noDrag?: boolean;
}

type UnpopulatedValue = { _id: string; label?: string };
type PopulatedValue = { _id: string; label: string };

function ReferenceMany({ onChange, ...props }: ReferenceManyProps) {
  const [textValue, setTextValue, { options, loading }] = useOptions(props.collection, props.reference);

  const [internalState, _setInternalState] = useState<PopulatedValue[]>([]);
  const setInternalState = (newState: PopulatedValue[]) => {
    _setInternalState(newState);
    onChange?.(newState);
  };

  // keep internal state in sync with changes made by parent
  useEffect(() => {
    (async () => {
      if (props.values) {
        const valuesAreLooselyDifferent = !(props.values as UnpopulatedValue[]).every(({ _id, label }) => {
          const internalIds = (internalState as PopulatedValue[]).map(({ _id }) => _id);
          return internalIds.includes(_id);
        });
        if (valuesAreLooselyDifferent) {
          _setInternalState(
            await populateReferenceValues(props.values, props.collection, props.reference?.fields)
          );
        }
      }
    })();
  }, [internalState, props.collection, props.reference?.fields, props.values]);

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const from = result.source.index;
    const to = result.destination?.index;
    if (from !== undefined && to !== undefined) {
      setInternalState(arrayMove(internalState, from, to));
    }
  };

  return (
    <Field
      label={props.label}
      description={props.description}
      color={props.color}
      font={props.font}
      isEmbedded={props.isEmbedded}
    >
      <div style={{ position: 'relative' }}>
        <Combobox
          label={props.label}
          description={props.description}
          disabled={props.disabled}
          options={options}
          values={internalState.map(({ _id: value, label }) => ({ value, label }))}
          many={true}
          color={props.color}
          font={props.font}
          onChange={(values) => {
            setInternalState(values.map(({ value, label }) => ({ _id: value.toString(), label })));
          }}
          onTextChange={(value) => setTextValue(value)}
          notFoundContent={
            loading && textValue ? 'Loading...' : !textValue ? 'Start typing to search.' : undefined
          }
        />
        <Selected
          onDragEnd={onDragEnd}
          label={props.label}
          font={props.font}
          internalState={[internalState, setInternalState]}
          color={props.color}
          collection={props.collection}
          noDrag={props.noDrag}
        />
      </div>
    </Field>
  );
}

interface SelectedProps {
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  label: string;
  font?: keyof themeType['font'];
  color?: colorType;
  internalState: [PopulatedValue[], (newState: PopulatedValue[]) => void];
  /**
   * Singular collection name.
   */
  collection: string;
  noDrag?: boolean;
}

function Selected(props: SelectedProps) {
  const theme = useTheme() as themeType;
  const [internalState, setInternalState] = props.internalState;

  return (
    <>
      {internalState.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 6, padding: '12px 0 6px 0' }}>
          <Button
            cssExtra={css`
              min-width: unset;
            `}
            height={26}
            border={{ base: '1px solid transparent' }}
            backgroundColor={{
              base:
                theme.mode === 'dark'
                  ? Color(theme.color.neutral.dark[100]).lighten(0.4).string()
                  : Color('#ffffff').darken(0.3).string(),
            }}
            onClick={() => setInternalState([])}
          >
            Clear all
          </Button>
        </div>
      ) : null}
      <DragDropContext onDragEnd={props.onDragEnd}>
        <Droppable droppableId={`selectMany-${props.label}`} direction={'vertical'}>
          {(provided) => (
            <DragZone ref={provided.innerRef} {...provided.droppableProps}>
              {internalState.map(({ _id, label }, index) => {
                return (
                  <Draggable draggableId={_id.toString()} index={index} key={index + _id.toString()}>
                    {(provided) => (
                      <SelectItem ref={provided.innerRef} {...provided.draggableProps} theme={theme}>
                        {props.noDrag ? null : <DragHandle {...provided.dragHandleProps} theme={theme} />}
                        <SelectContent>
                          <SelectText theme={theme} font={props.font}>
                            {label}
                          </SelectText>
                          <SelectText theme={theme} font={props.font}>
                            {capitalize(props.collection)} ID:{' '}
                            {
                              // if the ID is a URL, use everything after the first '/' in the URL (exlcuding the protocol)
                              isURL(_id) ? _id.replace('://', '').split('/')[1] : _id
                            }
                          </SelectText>
                        </SelectContent>
                        <OpenIcon
                          theme={theme}
                          color={props.color || 'primary'}
                          disabled={false}
                          onClick={() => {
                            if (isURL(_id)) {
                              window.open(_id, props.collection + _id, 'location=no');
                            } else if (props.collection.toLowerCase() === 'user') {
                              window.open(`/profile/${_id}`, props.collection + _id, 'location=no');
                            } else if (props.collection.toLowerCase() === 'team') {
                              window.open(`/teams/${_id}`, props.collection + _id, 'location=no');
                            } else if (props.collection.toLowerCase() === 'photo') {
                              window.open(`/cms/photo/library/${_id}`, props.collection + _id, 'location=no');
                            } else {
                              window.open(
                                `/cms/collection/${pluralize(props.collection.toLowerCase())}/${_id}`,
                                props.collection + _id,
                                'location=no'
                              );
                            }
                          }}
                        />
                        <RemoveIcon
                          theme={theme}
                          color={props.color || 'primary'}
                          disabled={false}
                          onClick={() => {
                            setInternalState([
                              ...internalState.slice(0, index),
                              ...internalState.slice(index + 1),
                            ]);
                          }}
                        />
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

const SelectItem = styled.div<{ theme: themeType }>`
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
`;

const SelectContent = styled.div`
  flex-grow: 1;
`;

const SelectText = styled.div<{ theme: themeType; font?: keyof themeType['font'] }>`
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

const DragHandle = styled(ReOrderDotsHorizontal24Regular)<{ theme: themeType }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  min-height: 38px;
  border-right: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  flex-shrink: 0;
`;

const RemoveIcon = styled(Dismiss24Regular)<{ theme: themeType; color: colorType; disabled?: boolean }>`
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

const OpenIcon = RemoveIcon.withComponent(Open24Regular);

export { ReferenceMany };
