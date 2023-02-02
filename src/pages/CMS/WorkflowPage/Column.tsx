import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import useDimensions from 'react-cool-dimensions';
import type { themeType } from '../../../utils/theme/theme';
import { Card } from './Card';

/**
 * Styled component for the column.
 *
 * This componenet is only the container for the column contents.
 */
const ColumnWrapper = styled.div<{ theme: themeType }>`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 36px 1fr;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    Color(theme.color.neutral[theme.mode][theme.mode === 'light' ? 100 : 200])
      .alpha(theme.mode === 'light' ? 0.3 : 0.1)
      .string()};
  border-radius: ${({ theme }) => theme.radius};
  box-sizing: border-box;
  overflow: auto;
`;

/**
 * Styled component for the column header bar.
 *
 * This componenet is only the container for the header bar contents.
 */
const TopBar = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
`;

/**
 * Styled component for the main content area of the column.
 * This area contains the cards..
 */
const ContentArea = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
`;

/**
 * Styled component for the title of the column.
 *
 * This componenet should be used within the header bar.
 */
const Title = styled.span<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

interface IDraggedCardMetadata {
  card_id: number;
  from_column_id: number;
  width: number;
  height: number;
}

/**
 * Wraps a card in a component that listens for cards that are moved.
 * This allows the drag-and-drop functionality to insert new cards before,
 * after, or between other cards.
 */
function ColumnSpace(props: {
  children: React.ReactNode;
  x: number;
  y: number;
  columnId: number;
  first?: boolean;
  last?: boolean;
  spaceCardId?: string;
  moveCard?: (
    to_column_id: number,
    from_column_id: number,
    card_id: number,
    position?: 'top' | 'bottom' | string
  ) => void;
}) {
  // get the theme information
  const theme = useTheme() as themeType;

  // listen for dropped cards
  // const [{ isOver, cardItem, isDragging }, drop] = useDrop(
  //   () => ({
  //     accept: 'project-card',
  //     drop: (item: IDraggedCardMetadata) => {
  //       if (props.moveCard) {
  //         // sends the requested new position for the dropped card so the UI
  //         // can be updated and the the GitHub backend can be updated
  //         const position = props.first ? 'top' : props.spaceCardId ? `after:${props.spaceCardId}` : 'bottom';
  //         props.moveCard(props.columnId, item.from_column_id, item.card_id, position);
  //       }
  //     },
  //     // provides the variables to the component via the first element in the
  //     // hook's array
  //     collect: (monitor) => ({
  //       isOver: !!monitor.isOver(),
  //       cardItem: monitor.getItem(),
  //       isDragging: !!monitor.canDrop(),
  //     }),
  //   }),
  //   [props.x, props.y, props.first, props.last, props.spaceCardId]
  // );
  const isOver = false;
  const cardItem: { height: number } | undefined = { height: 200 };
  const isDragging = false;

  return (
    <div
      css={css`
        transition: padding-bottom 120ms;
        transition-delay: ${isOver ? '350ms' : '0ms'};
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        opacity: ${isOver ? 0.75 : 1};
        &::after {
          content: '';
          position: absolute;
          margin-top: 6px;
          height: ${(props.first && cardItem) || (isDragging && isOver && cardItem) ? cardItem.height : `0`}px;
          width: 100%;
          background-color: ${Color(theme.color.primary[900]).alpha(0.05).string()};
          border: 1px dotted ${theme.color.primary[800]};
          opacity: ${props.first && isDragging ? '1' : isOver ? '1' : '0'};
          border-radius: 2px;
          transition: height 100ms opacity 100ms;
          transition-delay: ${isOver ? '350ms' : '0ms'};
          box-sizing: border-box;
        }
        padding-bottom: ${(props.first && cardItem) || (isOver && cardItem) ? cardItem.height + 6 : '0'}px;
      `}
      // ref={drop}
    >
      {props.children}
    </div>
  );
}

interface CardType {
  _id: string;
  name?: string;
  stage: number;
  in: string;
}

interface IColumn {
  title: string;
  id: number;
  moveCard?: (
    to_column_id: number,
    from_column_id: number,
    card_id: number,
    position?: 'top' | 'bottom' | string
  ) => void;
  cards?: CardType[];
}

/**
 * Creates a column of cards for the projects interface.
 */
function Column(props: IColumn) {
  const theme = useTheme();

  // get the dimensions of the column
  const { observe: colRef, width: x, height: y } = useDimensions();

  /**
   * Provides the CardSlot component with the required information.
   * Makes it easy to define the index for the card slot.
   */
  const CardSlotWrapper = (index: number, card?: CardType) => {
    return (
      <ColumnSpace
        key={index}
        x={x}
        y={y}
        columnId={props.id}
        moveCard={props.moveCard}
        first={index === -1}
        last={index + 1 === props.cards?.length}
        spaceCardId={card?._id}
      >
        {card ? <Card key={card._id} {...card}></Card> : null}
      </ColumnSpace>
    );
  };

  return (
    <ColumnWrapper theme={theme} ref={colRef}>
      <TopBar theme={theme}>
        <Title theme={theme}>{props.title}</Title>
      </TopBar>
      <ContentArea>
        {props.cards?.map((card, index: number) => {
          return CardSlotWrapper(index, card);
        })}
      </ContentArea>
    </ColumnWrapper>
  );
}

export { Column };
