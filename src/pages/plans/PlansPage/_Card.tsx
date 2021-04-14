/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import { Chip } from '../../../components/Chip';
import { useDrag } from 'react-dnd';
import { Card as ICard, FullAPIProject } from '../../../interfaces/github/plans';
import useDimensions from 'react-use-dimensions';
import { useMemo, useState } from 'react';
import { IconButton } from '../../../components/Button';
import {
  Archive16Regular,
  ChevronCircleDown24Regular,
  Delete16Regular,
  MoreHorizontal16Regular,
  Rename16Regular,
} from '@fluentui/react-icons';
import { useDropdown } from '../../../hooks/useDropdown';
import { Menu } from '../../../components/Menu';
import { useModal } from 'react-modal-hook';
import axios, { AxiosError, AxiosPromise, AxiosRequestConfig } from 'axios';
import { RefetchOptions } from 'axios-hooks';
import { toast } from 'react-toastify';
import { PlainModal } from '../../../components/Modal';
import { TextArea } from '../../../components/TextArea';

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

interface ICardE extends ICard {
  refetchProject?: (
    config?: AxiosRequestConfig | undefined,
    options?: RefetchOptions | undefined
  ) => AxiosPromise<FullAPIProject>;
}

/**
 * Creates a card for the projects interface.
 *
 * Notes: requires all props for the card (retrieve it from the GitHub API).
 */
function Card(props: ICardE) {
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

  // edit card note modal
  const [showEditCardNoteModal, hideEditCardNoteModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [noteValue, setNoteValue] = useState<HTMLTextAreaElement['value']>(props.note ? props.note : '');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * When the user types in the field, update `noteValue` in state
     */
    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNoteValue(e.target.value);
    };

    /**
     * Edit the note.
     *
     * @returns `true` if there were no errors; An `AxiosError` type if there was an error
     */
    const editNote = async (note: HTMLTextAreaElement['value']): Promise<true | AxiosError<any>> => {
      return await axios
        .patch(
          `/gh/projects/columns/cards/${props.id}`,
          {
            note: note,
          },
          {
            baseURL: `https://api.thepaladin.cristata.app/api/v2`,
            withCredentials: true,
          }
        )
        .then(
          async (): Promise<true> => {
            if (props.refetchProject) await props.refetchProject(); // refetch the project so that it incljdes the new card
            setIsLoading(false);
            return true;
          }
        )
        .catch(
          (err: AxiosError): AxiosError => {
            console.error(err);
            toast.error(`Failed to edit note. \n ${err.message}`);
            setIsLoading(false);
            return err;
          }
        );
    };

    return (
      <PlainModal
        hideModal={hideEditCardNoteModal}
        title={`Edit note`}
        continueButton={{
          text: 'Save',
          onClick: async () => {
            setIsLoading(true);
            const addStatus = await editNote(noteValue);
            // return whether the action was successful
            if (addStatus === true) return true;
            return false;
          },
          disabled: noteValue.length < 1,
        }}
        isLoading={isLoading}
      >
        <TextArea
          name={'edit-note'}
          id={'edit-note'}
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

  /**
   * Archives the card.
   */
  const archiveCard = async () => {
    return await axios
      .patch(
        `/gh/projects/columns/cards/${props.id}`,
        {
          archived: true,
        },
        {
          baseURL: `https://api.thepaladin.cristata.app/api/v2`,
          withCredentials: true,
        }
      )
      .then(async () => {
        if (props.refetchProject) await props.refetchProject(); // refetch the project so that it incljdes the new card
        toast.success(`Card archived`);
      })
      .catch((err: AxiosError) => {
        console.error(err);
        toast.error(`Failed to archive card. \n ${err.message}`);
      });
  };

  // delete card modal
  const [showDeleteCardModal, hideDeleteCardModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * Edit the note.
     *
     * @returns `true` if there were no errors; An `AxiosError` type if there was an error
     */
    const deleteCard = async (): Promise<true | AxiosError<any>> => {
      return await axios
        .delete(`/gh/projects/columns/cards/${props.id}`, {
          baseURL: `https://api.thepaladin.cristata.app/api/v2`,
          withCredentials: true,
        })
        .then(
          async (): Promise<true> => {
            if (props.refetchProject) await props.refetchProject(); // refetch the project so that it does not include the deleted card
            setIsLoading(false);
            return true;
          }
        )
        .catch(
          (err: AxiosError): AxiosError => {
            console.error(err);
            toast.error(`Failed to delete card. \n ${err.message}`);
            setIsLoading(false);
            return err;
          }
        );
    };

    return (
      <PlainModal
        hideModal={hideDeleteCardModal}
        title={`Delete card?`}
        text={`This cannot be undone.`}
        continueButton={{
          text: 'Yes, delete',
          onClick: async () => {
            setIsLoading(true);
            const addStatus = await deleteCard();
            // return whether the action was successful
            if (addStatus === true) return true;
            return false;
          },
          color: 'red',
        }}
        isLoading={isLoading}
      ></PlainModal>
    );
  });

  // remove card from project modal
  const [showRemoveCardModal, hideRemoveCardModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * Edit the note.
     *
     * @returns `true` if there were no errors; An `AxiosError` type if there was an error
     */
    const removeCard = async (): Promise<true | AxiosError<any>> => {
      return await axios
        .delete(`/gh/projects/columns/cards/${props.id}`, {
          baseURL: `https://api.thepaladin.cristata.app/api/v2`,
          withCredentials: true,
        })
        .then(
          async (): Promise<true> => {
            if (props.refetchProject) await props.refetchProject(); // refetch the project so that it does not include the deleted card
            setIsLoading(false);
            return true;
          }
        )
        .catch(
          (err: AxiosError): AxiosError => {
            console.error(err);
            toast.error(`Failed to remove card. \n ${err.message}`);
            setIsLoading(false);
            return err;
          }
        );
    };

    return (
      <PlainModal
        hideModal={hideRemoveCardModal}
        title={`Remove card from project?`}
        text={`You will be able to restore it from the **Add card** panel.`}
        continueButton={{
          text: 'Yes, remove from project',
          onClick: async () => {
            setIsLoading(true);
            const addStatus = await removeCard();
            // return whether the action was successful
            if (addStatus === true) return true;
            return false;
          },
          color: 'red',
        }}
        isLoading={isLoading}
      ></PlainModal>
    );
  });

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
                    onClick: archiveCard,
                  },
                  {
                    label: 'Remove from project',
                    icon: <ChevronCircleDown24Regular />,
                    onClick: showRemoveCardModal,
                  },
                ]
              : [
                  {
                    label: 'Edit',
                    icon: <Rename16Regular />,
                    onClick: showEditCardNoteModal,
                  },
                  {
                    label: 'Archive',
                    icon: <Archive16Regular />,
                    onClick: archiveCard,
                  },
                  /*{
                    label: 'Convert to issue',
                    icon: <Info16Regular />,
                  },*/
                  {
                    label: 'Delete',
                    icon: <Delete16Regular />,
                    onClick: showDeleteCardModal,
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
