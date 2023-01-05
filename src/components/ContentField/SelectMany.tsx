import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Add20Regular, Dismiss24Regular, ReOrderDotsHorizontal24Regular } from '@fluentui/react-icons';
import { arrayMoveImmutable as arrayMove } from 'array-move';
import Color from 'color';
import { useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDragHandleProps,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import { colorType, themeType } from '../../utils/theme/theme';
import { Button, buttonEffect, IconButton } from '../Button';
import { Combobox, Number, Text } from './';
import { Field, FieldProps } from './Field';

interface SelectManyProps extends Omit<FieldProps, 'children'> {
  type: 'String' | 'Float' | 'Int';
  values?: Values;
  color?: colorType;
  font?: keyof themeType['font'];
  disabled?: boolean;
  onChange?: (values: Values) => void;
  options?: Values;
  noDrag?: boolean;
}

type Values = StringValue[] | NumberValue[];
type StringValue = { value: string; label: string };
type NumberValue = { value: number; label: string };

function SelectMany({ onChange, ...props }: SelectManyProps) {
  const theme = useTheme() as themeType;

  const [internalState, _setInternalState] = useState(props.values || []);
  const setInternalState = (newState: StringValue[] | NumberValue[]) => {
    _setInternalState(newState);
    onChange?.(newState);
  };

  // keep internal state in sync with changes made by parent
  if (props.values) {
    const valuesAreLooselyDifferent = !(props.values as StringValue[]).every(({ value: propValue }) => {
      const internalValues = (internalState as StringValue[]).map(({ value }) => value.toString());
      return internalValues.includes(propValue.toString());
    });
    if (valuesAreLooselyDifferent) {
      _setInternalState(props.values);
    }
  }

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const from = result.source.index;
    const to = result.destination?.index;
    if (from !== undefined && to !== undefined) {
      setInternalState(arrayMove(internalState as StringValue[], from, to));
    }
  };

  // handle state for String type
  const [textValue, setTextValue] = useState<string>('');
  const addTextValueToInternalState = () => {
    if (textValue !== '') {
      if (textValue.includes(';')) {
        setInternalState([
          ...(internalState as StringValue[]),
          ...textValue.split(';').map((value) => ({ value, label: value })),
        ]);
      } else if (textValue.includes(',')) {
        setInternalState([
          ...(internalState as StringValue[]),
          ...textValue.split(',').map((value) => ({ value, label: value })),
        ]);
      } else {
        setInternalState([...(internalState as StringValue[]), { value: textValue, label: textValue }]);
      }
      setTextValue('');
    }
  };

  // handle state for number type
  const [numberValue, setNumberValue] = useState<number>();
  const addNumberValueToInternalState = () => {
    if (numberValue) {
      setInternalState([...(internalState as NumberValue[]), { value: numberValue, label: `${numberValue}` }]);
      setTextValue('');
    }
  };

  if (props.options) {
    return (
      <Field
        label={props.label}
        description={props.description}
        disabled={props.disabled}
        color={props.color}
        font={props.font}
        isEmbedded={props.isEmbedded}
      >
        <div style={{ position: 'relative' }}>
          <Combobox
            label={props.label}
            description={props.description}
            disabled={props.disabled}
            options={props.options}
            values={internalState}
            many={true}
            color={props.color}
            font={props.font}
            onChange={(values) => setInternalState(values)}
          />
          <Selected
            onDragEnd={onDragEnd}
            label={props.label}
            font={props.font}
            internalState={[internalState, setInternalState]}
            color={props.color}
            noDrag={props.noDrag}
          />
        </div>
      </Field>
    );
  }

  if (props.type === 'String') {
    return (
      <Field
        label={props.label}
        description={props.description}
        disabled={props.disabled}
        color={props.color}
        font={props.font}
        isEmbedded={props.isEmbedded}
      >
        <div style={{ position: 'relative' }}>
          <Text
            disabled={props.disabled}
            style={{ paddingRight: '42px' }}
            color={props.color}
            font={props.font}
            label={'__in-select'}
            value={textValue}
            onChange={(e) => setTextValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTextValueToInternalState();
              }
            }}
          />

          <AddButton
            theme={theme}
            icon={<Add20Regular />}
            onClick={addTextValueToInternalState}
            disabled={props.disabled}
          />
          <Selected
            disabled={props.disabled}
            onDragEnd={onDragEnd}
            label={props.label}
            font={props.font}
            internalState={[internalState, setInternalState]}
            color={props.color}
            noDrag={props.noDrag}
          />
        </div>
      </Field>
    );
  }

  if (props.type === 'Int' || props.type === 'Float') {
    return (
      <Field
        label={props.label}
        description={props.description}
        disabled={props.disabled}
        color={props.color}
        font={props.font}
        isEmbedded={props.isEmbedded}
      >
        <div style={{ position: 'relative' }}>
          <Number
            disabled={props.disabled}
            style={{ paddingRight: '42px' }}
            type={props.type}
            color={props.color}
            font={props.font}
            label={'__in-select'}
            value={textValue}
            onChange={(e) => setNumberValue(e.currentTarget.valueAsNumber)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addNumberValueToInternalState();
              }
            }}
          />
          <AddButton
            theme={theme}
            icon={<Add20Regular />}
            onClick={addNumberValueToInternalState}
            disabled={props.disabled}
          />
          <Selected
            disabled={props.disabled}
            onDragEnd={onDragEnd}
            label={props.label}
            font={props.font}
            internalState={[internalState, setInternalState]}
            color={props.color}
            noDrag={props.noDrag}
          />
        </div>
      </Field>
    );
  }

  return <div>oops!</div>;
}

interface SelectedProps {
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  label: string;
  font?: keyof themeType['font'];
  color?: colorType;
  internalState: [StringValue[] | NumberValue[], (newState: StringValue[] | NumberValue[]) => void];
  noDrag?: boolean;
  disabled?: boolean;
}

function Selected(props: SelectedProps) {
  const theme = useTheme() as themeType;
  const [internalState, setInternalState] = props.internalState;

  return (
    <>
      {internalState.length > 0 ? (
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
              {internalState.map(({ value, label }, index) => {
                return (
                  <Draggable draggableId={value.toString()} index={index} key={index + value.toString()}>
                    {(provided) => (
                      <SelectItem ref={provided.innerRef} {...provided.draggableProps} theme={theme}>
                        {props.noDrag || props.disabled ? null : (
                          <DragHandle dragHandleProps={provided.dragHandleProps} theme={theme} />
                        )}
                        <SelectText theme={theme} font={props.font}>
                          {label}
                        </SelectText>
                        <IconWrapper
                          theme={theme}
                          color={props.color || 'primary'}
                          disabled={props.disabled}
                          onClick={() => {
                            if (!props.disabled) {
                              setInternalState([
                                ...(internalState.slice(0, index) as StringValue[]),
                                ...(internalState.slice(index + 1) as StringValue[]),
                              ]);
                            }
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

const AddButton = styled(IconButton)`
  position: absolute;
  top: 1px;
  right: 0;
  border-color: transparent !important;
  height: 34px;
  width: 34px;
`;

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
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const SelectText = styled.div<{ theme: themeType; font?: keyof themeType['font'] }>`
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  line-height: 16px;
  padding: 10px;
  flex-wrap: nowrap;
  flex-grow: 1;
  word-break: break-word;
`;

function DragHandle(props: { theme: themeType; dragHandleProps?: DraggableProvidedDragHandleProps }) {
  return (
    <DragHandleComponent theme={props.theme} {...props.dragHandleProps}>
      <ReOrderDotsHorizontal24Regular />
    </DragHandleComponent>
  );
}

const DragHandleComponent = styled.span<{ theme: themeType }>`
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

export { SelectMany };
