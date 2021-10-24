/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { ChevronDown12Regular, ChevronUp12Regular } from '@fluentui/react-icons';
import { DateTimePicker } from '@material-ui/pickers';
import { useRef, useState } from 'react';
import { buttonEffect, IconButton } from '../../../components/Button';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { DateTime } from 'luxon';

type eventType = {
  name: string;
  date: string;
  location: string;
};

interface IEventGroup extends Omit<CustomFieldProps, 'state'> {
  event: eventType;
  events: eventType[];
  index: number;
  isRemoveMode?: boolean;
}

function EventGroup({ event, events, index, dispatch, ...props }: IEventGroup) {
  const { setField } = props.setStateFunctions;
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  /**
   * Prevent new lines in fields.
   *
   * Use this in the `onKeyDown` prop.
   */
  const preventNewLines = (e: React.KeyboardEvent) => {
    const keyCode = e.keyCode || e.which;
    if (keyCode === 13) e.preventDefault();
  };

  /**
   * When a `contenteditable` element is blurred, update the value in state.
   */
  const handleCEBlur = (text: string | null, index: number, key: 'name' | 'location' | 'date') => {
    if (key && text !== null) {
      if (events && events[index][key] !== text) {
        const copy = JSON.parse(JSON.stringify(events));
        copy[index][key] = text;
        dispatch(setField(copy, 'events'));
      }
    }
  };

  /**
   * Move an event up or down in the array.
   */
  const moveEvent = (index: number, direction: -1 | 1) => {
    if (events && events[index]) {
      const copy = JSON.parse(JSON.stringify(events));
      copy.splice(direction === -1 ? index - 1 : index + 1, 0, copy.splice(index, 1)[0]);
      dispatch(setField(copy, 'events'));
    }
  };

  /**
   * Attributes for contenteditable elements
   */
  const contentEditableAttrs = {
    contentEditable: true,
    onKeyPress: preventNewLines, // prevent new lines
    suppressContentEditableWarning: true, // suppress warning from react about managed contenteditable element
  };

  return (
    <EventGroupComponent onMouseEnter={() => setIsMouseOver(true)} onMouseLeave={() => setIsMouseOver(false)}>
      {isMouseOver && !props.isRemoveMode ? (
        <>
          <Dir direction={-1}>
            <IconButton
              data-tip={'Move up'}
              icon={<ChevronUp12Regular />}
              width={'20px'}
              height={'21px'}
              onClick={() => moveEvent(index, -1)}
              cssExtra={css`
                svg {
                  width: 10px !important;
                  height: 10px !important;
                }
              `}
            />
          </Dir>
          <Dir direction={1}>
            <IconButton
              data-tip={'Move down'}
              icon={<ChevronDown12Regular />}
              width={'20px'}
              height={'21px'}
              onClick={() => moveEvent(index, 1)}
              cssExtra={css`
                svg {
                  width: 10px !important;
                  height: 10px !important;
                }
              `}
            />
          </Dir>
        </>
      ) : null}
      <Line isFirst={index === 0} isLast={index === events.length - 1} />
      <Circle />
      <EventLabel
        {...contentEditableAttrs}
        onBlur={(e) => handleCEBlur(e.currentTarget.textContent, index, 'name')}
      >
        {event.name}
      </EventLabel>
      <EventDescription>
        <span
          data-tip={'Change date'}
          css={css`
            white-space: nowrap;
            ${buttonEffect(
              'primary',
              800,
              props.theme,
              false,
              { base: 'transparent' },
              { base: '1px solid transparent' }
            )}
          `}
          onClick={() => {
            if (datePickerRef && datePickerRef.current && datePickerRef.current.firstElementChild) {
              (datePickerRef.current.firstElementChild as HTMLDivElement).click();
            }
          }}
        >
          {DateTime.fromISO(event.date).toFormat('cccc')} at{' '}
          {DateTime.fromISO(event.date).toLocaleString(DateTime.TIME_SIMPLE)}
        </span>
        &nbsp;–&nbsp;
        <span
          {...contentEditableAttrs}
          onBlur={(e) => handleCEBlur(e.currentTarget.textContent, index, 'location')}
          css={css`
            flex-grow: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          `}
        >
          {event.location}
        </span>
      </EventDescription>
      <EventCode></EventCode>
      <div ref={datePickerRef} style={{ height: 0, width: 0 }}>
        <DateTimePicker
          value={undefined}
          onChange={(datetime) => handleCEBlur(datetime?.toISO() || null, index, 'date')}
          animateYearScrolling
        />
      </div>
    </EventGroupComponent>
  );
}

const EventGroupComponent = styled.div`
  display: flex;
  flex-direction: column;
  height: 0.44in;
  height: 100%;
  position: relative;
  box-sizing: border-box;
`;

const Dir = styled.div<{ direction: -1 | 1 }>`
  display: flex;
  height: 10px;
  width: 10px;
  position: absolute;
  left: -20px;
  top: ${({ direction }) => (direction === -1 ? 0 : 21)}px;
`;

const EventLabel = styled.h3`
  font-family: Lato;
  font-size: 12pt;
  font-weight: 500;
  color: black;
  width: calc(100% - 0.58in - 0.3in);
  height: 0.28in;
  height: 100%;
  margin: 0 0 0 0.3in;
  padding: 0;
  padding: 0.071in 0 0.01in 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  box-sizing: border-box;
`;

const EventDescription = styled.span`
  font-family: Lato;
  font-size: 11pt;
  font-weight: normal;
  font-style: italic;
  color: rgba(0, 0, 0, 0.65);
  width: calc(100% - 0.3in);
  height: 0.16in;
  margin: 0 0 0 0.3in;
  padding: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  box-sizing: border-box;
`;

const EventCode = styled.div`
  font-family: 'Dank Mono';
  font-size: 10pt;
  font-weight: normal;
  font-style: italic;
  color: rgba(0, 0, 0, 0.65);
  width: 0.58in;
  height: 0.28in;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  position: absolute;
  top: 0;
  right: 0;
  box-sizing: border-box;
`;

const Line = styled.div<{ isLast?: boolean; isFirst?: boolean }>`
  display: block;
  height: calc(
    ${({ isFirst, isLast }) => (isFirst ? `100% - 0.05in` : isLast ? `100% + 0.05in` : `100%`)} + 3pt
  );
  width: 3pt;
  background-color: black;
  position: absolute;
  left: calc(2pt + 0.11in / 2 - 1.5pt);
  top: calc(${({ isFirst }) => (isFirst ? 0.05 : 0)}in - 1.5pt);
  border-radius: 1.5pt;
`;

const Circle = styled.div`
  display: block;
  height: calc(0.11in - 1.5pt);
  width: calc(0.11in - 1.5pt);
  background-color: white;
  box-shadow: 0 0 0 2pt black;
  border-radius: 50%;
  position: absolute;
  left: calc(0.11in - 5pt);
  top: 0.14in;
`;

export { EventGroup };
