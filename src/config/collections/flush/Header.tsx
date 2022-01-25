import styled from '@emotion/styled/macro';
import { ChangeEvent, useState } from 'react';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { SelectionOverlay } from './SelectionOverlay';
import roman from 'romans';
import { DateTime } from '../../../components/DateTime';
import { css } from '@emotion/react';
import { formatISODate } from '../../../utils/formatISODate';

function Header({ state, dispatch, ...props }: CustomFieldProps) {
  const { setField } = props.setStateFunctions;

  const handleVolIssueChange = (e: ChangeEvent<HTMLInputElement>, key: string) => {
    let num = Math.round(parseInt(e.currentTarget.value));
    if (num < 1) num = 1;
    dispatch(setField(num, key));
  };

  return (
    <>
      <Masthead>The Royal Flush</Masthead>
      <Row>
        <RowItem
          justify={'flex-start'}
          EditComponent={
            <div
              style={{
                display: 'flex',
                fontFamily: 'Georgia',
                fontSize: '10pt',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'flex-start',
                whiteSpace: 'nowrap',
              }}
            >
              Week of{' '}
              <DateTime
                value={
                  state.fields['timestamps.week'] === '0001-01-01T01:00:00.000Z'
                    ? null
                    : (state.fields['timestamps.week'] as string)
                }
                onChange={(date) => {
                  if (date) dispatch(setField(date.toUTC().toISO(), 'timestamps.week'));
                }}
                style={css`
                  height: 24px;
                  padding: 3px 8px !important;
                `}
              />
            </div>
          }
        >
          Week of {formatISODate(state.fields['timestamps.week'])}
        </RowItem>
        <RowItem justify={'center'}>THEPALADIN.NEWS/FLUSHER</RowItem>
        <RowItem
          justify={'flex-end'}
          EditComponent={
            <div
              style={{
                display: 'flex',
                fontFamily: 'Georgia',
                fontSize: '10pt',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'flex-end',
              }}
            >
              Volume{' '}
              <input
                type={'number'}
                style={{ width: 30, borderRadius: 2, height: '10pt' }}
                onChange={(e) => handleVolIssueChange(e, 'volume')}
                value={state.fields['volume']}
              />
              Issue{' '}
              <input
                type={'number'}
                style={{ width: 30, borderRadius: 2, height: '10pt' }}
                onChange={(e) => handleVolIssueChange(e, 'issue')}
                value={state.fields['issue']}
              />
            </div>
          }
        >
          Volume{' '}
          {!isNaN(parseInt(state.fields['volume'])) ? roman.romanize(parseInt(state.fields['volume'])) : '??'},
          Issue {state.fields['issue'] || '??'}
        </RowItem>
      </Row>
    </>
  );
}

interface IRowItem {
  children?: React.ReactNode;
  justify: 'flex-start' | 'center' | 'flex-end';
  EditComponent?: React.ReactNode;
}

function RowItem(props: IRowItem) {
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  if (!props.EditComponent) {
    return <RowItemComponent justify={props.justify}>{props.children}</RowItemComponent>;
  }

  return (
    <Wrapper
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      justify={props.justify}
    >
      <SelectionOverlay isShown={isMouseOver} isCompact>
        {props.EditComponent}
      </SelectionOverlay>
      <RowItemComponent justify={props.justify}>{props.children}</RowItemComponent>
    </Wrapper>
  );
}

const Wrapper = styled.div<{ justify: 'flex-start' | 'center' | 'flex-end' }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${({ justify }) => justify};
  cursor: default;
`;

const Masthead = styled.h1`
  font-family: 'Adamant BG';
  font-size: 36pt;
  font-weight: bold;
  color: black;
  text-transform: uppercase;
  font-style: italic;
  margin: -0.25in 0 0 0;
  padding: 0.08in 0.04in 0.04in 0.04in;
  height: 1in;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  cursor: default;
`;

const Row = styled.div`
  border-top: 2pt solid;
  border-bottom: 2pt solid;
  border-color: black;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 0.3in;
  box-sizing: border-box;
  cursor: default;
`;

const RowItemComponent = styled.div<{ justify: 'flex-start' | 'center' | 'flex-end' }>`
  font-family: Georgia;
  font-size: 10pt;
  font-weight: normal;
  font-style: normal;
  font-variant-numeric: lining-nums;
  color: black;
  display: flex;
  align-items: center;
  justify-content: ${({ justify }) => justify};
  flex-wrap: nowrap;
  box-sizing: border-box;
  white-space: pre;
  cursor: default;
`;

export { Header };
