/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import { Chip } from '../../../components/Chip';
import { useDrag } from 'react-dnd';
import { Card as ICard } from '../../../interfaces/github/plans';
import useDimensions from 'react-use-dimensions';
import { useMemo } from 'react';
import { IconButton } from '../../../components/Button';
import {
  Archive16Regular,
  ChevronCircleDown24Regular,
  Delete16Regular,
  Info16Regular,
  MoreHorizontal16Regular,
  Rename16Regular,
} from '@fluentui/react-icons';
import { useDropdown } from '../../../hooks/useDropdown';
import { Menu } from '../../../components/Menu';

/**
 * Styled component for the card.
 *
 * This componenet is only the container for the card contents
 */
const CardContainer = styled.div<{ theme: themeType; isDragging: boolean }>`
  display: block;
  border: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  width: 100%;
  box-sizing: border-box;
`;

/**
 * Styled component for the note inside each card.
 *
 * If the card is linked to an issue, this componenet will style the note
 * like a hyperlink.
 */
const Note = styled.p<{ theme: themeType; href?: string }>`
  font-family: ${({ theme, href }) => (href ? theme.font.headline : theme.font.body)};
  font-size: ${({ href }) => (href ? 14.25 : 15)}px;
  color: ${({ href, theme }) => (href ? theme.color.primary[800] : theme.color.neutral[theme.mode][1500])};
  font-weight: ${({ href }) => (href ? 400 : 400)};
  &:hover {
    ${({ href }) => (href ? `text-decoration: underline; cursor: pointer` : '')}
  }
  white-space: pre-line;
  margin: 0;
`;

/**
 * Styled component for the byline for the card.
 */
const By = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-weight: 400;
  margin-top: 10px;
`;

/**
 * Creates a card for the projects interface.
 *
 * Notes: requires all props for the card (retrieve it from the GitHub API).
 */
function Card(props: ICard) {
  // access the theme variables
  const theme = useTheme() as themeType;

  // get the dimensions of the card
  const [cardRef, { height: cardHeight }] = useDimensions();

  // drag and drop support
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'project-card',
    // the item object is used to provide data to the column component
    // so it can know basic data about the card that is dropped on it
    item: {
      // provide the width and height so the column component can add space for the user to drop the card
      height: cardHeight || 100, // fall back to 100 if height is not calculated in time
      card_id: props.id,
      from_column_id: props.column_id,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // data for the note
  const note = useMemo(() => {
    return {
      href: props.issue?.html_url,
      onClick: () => {
        // if there is a link to the issue, clicking goes to the issue
        if (props.issue?.html_url) {
          window.open(props.issue.html_url);
        }
      },
      content: () => {
        // if card linked to issue, use issue title
        if (props.issue) {
          return props.issue.title;
        }
        // otherwise, is card note
        return props.note;
      },
    };
  }, [props.issue, props.note]);

  // data for byline
  const by = useMemo(() => {
    return {
      isIssue: props.issue ? true : false,
      repoName: function () {
        if (this.isIssue) {
          // the url for the repo ends in the repo name, so we can
          // split the url into an array at each '/' and pop will return
          // the last element in the array
          return props.issue?.repository_url.split('/').pop();
        }
        return null;
      },
      username: function () {
        if (this.isIssue) {
          return props.issue!.user.login;
        }
        return props.creator.login;
      },
      content: function () {
        if (this.isIssue) {
          return `${this.repoName()}#${props.issue!.number} opened by ${this.username()}`;
        }
        return `Added by ${this.username()}`;
      },
    };
  }, [props.creator.login, props.issue]);

  const labels = useMemo(() => {
    return {
      generate: () => {
        if (props.issue) {
          return (
            <div style={{ display: 'flex', marginTop: 10, flexWrap: 'wrap' }}>
              {props.issue.labels.map((label, index: number) => {
                return <Chip label={label.name} key={index}></Chip>;
              })}
            </div>
          );
        }
        return null;
      },
    };
  }, [props.issue]);

  // dropdown/three-dot menu
  const [showDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left + triggerRect.width - 240,
            width: 240,
          }}
          items={
            props.issue
              ? [
                  {
                    label: 'Archive',
                    icon: <Archive16Regular />,
                  },
                  {
                    label: 'Remove from project',
                    icon: <ChevronCircleDown24Regular />,
                  },
                ]
              : [
                  {
                    label: 'Rename',
                    icon: <Rename16Regular />,
                  },
                  {
                    label: 'Archive',
                    icon: <Archive16Regular />,
                  },
                  {
                    label: 'Convert to issue',
                    icon: <Info16Regular />,
                  },
                  {
                    label: 'Delete',
                    icon: <Delete16Regular />,
                    color: 'red',
                  },
                ]
          }
        />
      );
    },
    [],
    true,
    true
  );

  return (
    <div ref={drag}>
      <CardContainer ref={cardRef} theme={theme} isDragging={isDragging}>
        <IconButton
          icon={<MoreHorizontal16Regular />}
          cssExtra={css`
            border-color: transparent;
            background-color: transparent;
            position: relative;
            float: right;
            right: -7px;
            top: -6px;
          `}
          onClick={showDropdown}
        />
        <Note href={note.href} onClick={note.onClick} theme={theme}>
          {note.content()}
        </Note>
        <By theme={theme}>{by.content()}</By>
        {labels.generate()}
      </CardContainer>
    </div>
  );
}

export { Card };
