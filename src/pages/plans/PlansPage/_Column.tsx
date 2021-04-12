/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import Color from 'color';
import { useDrop } from 'react-dnd';
import useDimensions from 'react-use-dimensions';
import React, { useState } from 'react';
import { css } from '@emotion/react';
import { Card as CardType, FullAPIProject } from '../../../interfaces/github/plans';
import { Card } from './_Card';
import { IconButton } from '../../../components/Button';
import { Add16Regular, MoreHorizontal16Regular, Rename16Regular } from '@fluentui/react-icons';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../../components/Modal';
import axios, { AxiosError, AxiosPromise, AxiosRequestConfig } from 'axios';
import { RefetchOptions } from 'axios-hooks';
import { toast } from 'react-toastify';
import { useDropdown } from '../../../hooks/useDropdown';
import { Menu } from '../../../components/Menu';
import { TextArea } from '../../../components/TextArea';

/**
 * Styled component for the column.
 *
 * This componenet is only the container for the column contents.
 */
const ColumnWrapper = styled.div<{ theme: themeType }>`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 36px 1fr;
  border: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][300]};
  background-color: ${({ theme }) => Color(theme.color.neutral[theme.mode][100]).alpha(0.5).string()};
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
  border-bottom: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][300]};
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
  spaceCardId?: number;
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
  const [{ isOver, cardItem, isDragging }, drop] = useDrop(
    () => ({
      accept: 'project-card',
      drop: (item: IDraggedCardMetadata) => {
        if (props.moveCard) {
          // sends the requested new position for the dropped card so the UI
          // can be updated and the the GitHub backend can be updated
          const position = props.first ? 'top' : props.spaceCardId ? `after:${props.spaceCardId}` : 'bottom';
          props.moveCard(props.columnId, item.from_column_id, item.card_id, position);
        }
      },
      // provides the variables to the component via the first element in the
      // hook's array
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        cardItem: monitor.getItem(),
        isDragging: !!monitor.canDrop(),
      }),
    }),
    [props.x, props.y, props.first, props.last, props.spaceCardId]
  );

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
      ref={drop}
    >
      {props.children}
    </div>
  );
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
  refetch?: (
    config?: AxiosRequestConfig | undefined,
    options?: RefetchOptions | undefined
  ) => AxiosPromise<FullAPIProject>;
}

/**
 * Creates a column of cards for the projects interface.
 */
function Column(props: IColumn) {
  // get the theme information
  const theme = useTheme() as themeType;

  // get the dimensions of the column
  const [colRef, { x, y }] = useDimensions();

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
        spaceCardId={card?.id}
      >
        {card ? <Card key={card.id} {...card}></Card> : null}
      </ColumnSpace>
    );
  };

  const [showAddCardModal, hideAddCardModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [noteValue, setNoteValue] = useState<HTMLTextAreaElement['value']>('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * When the user types in the field, update `noteValue` in state
     */
    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNoteValue(e.target.value);
    };

    /**
     * Add the note to the column by posting it to the API.
     *
     * @returns `true` if there were no errors; An `AxiosError` type if there was an error
     */
    const addNote = async (note: HTMLTextAreaElement['value']): Promise<true | AxiosError<any>> => {
      return await axios
        .post(
          `/gh/projects/columns/${props.id}/cards`,
          {
            note: note,
          },
          {
            baseURL: `http://localhost:3001/api/v2`,
            withCredentials: true,
          }
        )
        .then(
          async (): Promise<true> => {
            if (props.refetch) await props.refetch(); // refetch the project so that it incljdes the new card
            setIsLoading(false);
            return true;
          }
        )
        .catch(
          (err: AxiosError): AxiosError => {
            console.error(err);
            toast.error(`Failed to add note. \n ${err.message}`);
            setIsLoading(false);
            return err;
          }
        );
    };

    return (
      <PlainModal
        hideModal={hideAddCardModal}
        title={`Add new note`}
        continueButton={{
          text: 'Add',
          onClick: async () => {
            setIsLoading(true);
            const addStatus = await addNote(noteValue);
            // return whether the action was successful
            if (addStatus === true) return true;
            return false;
          },
          disabled: noteValue.length < 1,
        }}
        isLoading={isLoading}
      >
        <TextArea
          name={'add-note'}
          id={'add-note'}
          theme={theme}
          font={'body'}
          rows={5}
          value={noteValue}
          onChange={handleNoteChange}
          placeholder={`Type note...`}
        ></TextArea>
      </PlainModal>
    );
  });

  const [showColumnDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left + triggerRect.width - 240,
            width: 240,
          }}
          items={[
            {
              label: 'Rename column',
              onClick: () => console.log('hi'),
              icon: <Rename16Regular />,
            },
            {
              label: 'Archive all cards',
            },
            {
              label: 'Delete column',
              color: 'red',
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  return (
    <ColumnWrapper theme={theme} ref={colRef}>
      <TopBar theme={theme}>
        <Title theme={theme}>{props.title}</Title>
        <IconButton
          icon={<Add16Regular />}
          cssExtra={css`
            border-color: transparent;
            background-color: transparent;
            position: absolute;
            right: 36px;
          `}
          onClick={showAddCardModal}
        />
        <IconButton
          icon={<MoreHorizontal16Regular />}
          cssExtra={css`
            border-color: transparent;
            background-color: transparent;
            position: absolute;
            right: 4px;
          `}
          onClick={showColumnDropdown}
        />
      </TopBar>
      <ContentArea>
        {CardSlotWrapper(-1)}
        {props.cards?.map((card, index: number) => {
          return CardSlotWrapper(index, card);
        })}
      </ContentArea>
    </ColumnWrapper>
  );
}

export { Column };
