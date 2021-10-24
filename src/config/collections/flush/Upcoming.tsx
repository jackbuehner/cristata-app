/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { Button, IconButton } from '../../../components/Button';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { EventGroup } from './EventGroup';
import { IFlush } from './flush';
import { SectionHead } from './SectionHead';
import { Checkbox as RmwcCheckbox } from '@rmwc/checkbox';
import '@material/checkbox/dist/mdc.checkbox.css';
import { CalendarAdd20Regular, Delete20Regular, Dismiss20Regular } from '@fluentui/react-icons';

const Checkbox = styled(RmwcCheckbox)<{ label?: string; checked?: boolean; onChange?: () => void }>`
  --mdc-theme-secondary: black;
`;

interface IUpcoming extends CustomFieldProps {
  height?: string;
}

function Upcoming({ state, dispatch, ...props }: IUpcoming) {
  const { setField } = props.setStateFunctions;

  const events = state.fields['events'] as IFlush['events'];

  const [isRemoveMode, setIsRemoveMode] = useState<boolean>(false);
  const [toRemove, setToRemove] = useState<number[]>([]);

  /**
   * Add an event object to the array of events;
   */
  const addEvent = () => {
    if (events) {
      dispatch(
        setField(
          [...events, { name: 'New event', date: '0001-01-01T01:00:00.000+00:00', location: 'location' }],
          'events'
        )
      );
    }
  };

  /**
   * Remove elements from an array by index. Indices may be specified in any order. Do not use negative indices.
   */
  const removeEvents = (indices: number[]) => {
    // prepare a deep copy of events
    const copy: IFlush['events'] = JSON.parse(JSON.stringify(events));

    if (copy) {
      // remove duplicates
      indices = [...new Set(indices)];

      // sort so that larger indices are deleted first
      indices.sort((a, b) => b - a);

      // remove each element from the specified indices.
      indices.forEach((index) => {
        copy.splice(index, 1);
      });

      // dispatch a state change to events with the events removed
      dispatch(setField(copy, 'events'));

      // empty the array of indices to remove
      setToRemove([]);
    }
  };

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  return (
    <Container height={props.height}>
      <SectionHead>Upcoming events</SectionHead>
      {events ? (
        <div
          css={css`
            display: flex;
            flex-direction: row;
            gap: 6px;
            width: 180px;
            position: absolute;
            top: 20px;
            right: 0;
            justify-content: flex-end;
          `}
        >
          {isRemoveMode ? (
            <>
              <Button
                onClick={() => {
                  removeEvents(toRemove);
                  setIsRemoveMode(false);
                }}
                cssExtra={css`
                  flex: 1;
                `}
              >
                Remove selected
              </Button>
              <IconButton
                icon={<Dismiss20Regular />}
                onClick={() => setIsRemoveMode(false)}
                data-tip={'Cancel'}
              />
            </>
          ) : (
            <>
              {events.length < 14 ? (
                <IconButton icon={<CalendarAdd20Regular />} onClick={addEvent} data-tip={'Add event'} />
              ) : null}
              <IconButton
                icon={<Delete20Regular />}
                onClick={() => setIsRemoveMode(true)}
                data-tip={'Remove events'}
              />
            </>
          )}
        </div>
      ) : null}
      {events?.map((event, index, array) => {
        return (
          <div
            key={index}
            css={css`
              display: flex;
              flex-direction: row;
            `}
          >
            {isRemoveMode ? (
              <Checkbox
                checked={toRemove.includes(index)}
                onChange={() => {
                  if (toRemove.includes(index)) {
                    setToRemove(toRemove.filter((n) => n !== index));
                  } else {
                    setToRemove([...toRemove, index]);
                  }
                }}
              />
            ) : null}
            <div
              css={css`
                flex: 1;
              `}
            >
              <EventGroup
                event={event}
                index={index}
                events={array}
                dispatch={dispatch}
                isRemoveMode={isRemoveMode}
                {...props}
              />
            </div>
          </div>
        );
      })}
    </Container>
  );
}

const Container = styled.div<{ height?: string }>`
  display: flex;
  flex-direction: column;
  height: ${({ height }) => height};
  flex-wrap: column;
  box-sizing: border-box;
  z-index: 1;
  position: relative;
`;

export { Upcoming };
