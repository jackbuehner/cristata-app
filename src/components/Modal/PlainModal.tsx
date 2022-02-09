/** @jsx-import-source @emotion/react */
import { ClassNames, useTheme } from '@emotion/react';
import Color from 'color';
import { useEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import { colorType, themeType } from '../../utils/theme/theme';
import { Button } from '../../components/Button';
import styled from '@emotion/styled/macro';
import { LinearProgress } from '@rmwc/linear-progress';
import '@material/linear-progress/dist/mdc.linear-progress.css';

/**
 * Title component for plain modal.
 *
 * If the modal only has text (no children), `padding-bottom` is 9px.
 * If the modal has children, the `padding-bottom` the title increases and
 * a bottom border is added.
 */
const PlainModalTitle = styled.h1<{
  modalHasChildren: boolean;
  theme: themeType;
}>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 20px;
  font-weight: 600;
  line-height: 1.24;
  padding: ${({ modalHasChildren }) => (modalHasChildren ? `0 24px 20px 24px` : `0 24px 9px 24px`)};
  border-bottom: ${({ theme, modalHasChildren }) =>
    modalHasChildren ? `1px solid ${theme.color.neutral[theme.mode][200]}` : `1px solid transparent`};
  margin: 0;
  position: relative;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  // ensure there is 40px betweeen the top of the modal and the baseline of the header text
  &::before {
    content: '';
    display: inline-block;
    width: 0;
    height: 40px;
    vertical-align: baseline;
  }
`;

/**
 * Content container component for plain modal.
 *
 * If the modal only has text (no children), `padding-top` is 0.
 * If the modal has children, the `padding-top` value is changed to match
 * `padding-bottom`.
 */
const PlainModalContent = styled.div<{
  theme: themeType;
  modalHasChildren: boolean;
  titleHeight: number;
  actionRowHeight: number;
}>`
  padding: ${({ modalHasChildren }) => (modalHasChildren ? `20px 24px` : `0 24px 20px 24px`)};
  overflow: auto;
  max-height: ${({ theme, titleHeight, actionRowHeight }) =>
    `calc(100vh - 40px - 40px - ${theme.dimensions.titlebar.height} - ${titleHeight}px - ${actionRowHeight}px)`};
`;

/**
 * Text Componenet for plain modal.
 */
const PlainModalText = styled.p<{ theme: themeType }>`
  margin: 0;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 16px;
  font-weight: 400;
`;

/**
 * Button container component for plain modal.
 *
 * If the modal has children (no text), the padding is changed so that the
 * buttons are right-aligned with the the content. A top border is also added.
 */
const ActionRow = styled.div<{ modalHasChildren: boolean; theme: themeType }>`
  padding: ${({ modalHasChildren }) => (modalHasChildren ? `16px 24px` : `11px`)};
  border-top: ${({ theme, modalHasChildren }) =>
    modalHasChildren ? `1px solid ${theme.color.neutral[theme.mode][200]}` : `1px solid transparent`};
  flex-wrap: wrap;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`;

/**
 * The indeterminate progressbar that appears by the modal title when `isLoading` is `true`.
 *
 * It appears underneath the title when there are children, and it appears at the top of the modal
 * when there are no children
 */
const IndeterminateProgress = styled(LinearProgress)<{
  modalHasChildren: boolean;
  theme: themeType;
}>`
  --mdc-theme-primary: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
  position: absolute !important;
  left: 0;
  ${({ modalHasChildren }) => (modalHasChildren ? `bottom: 0;` : `top: 0;`)};
  .mdc-linear-progress__buffer {
    background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  }
  .mdc-linear-progress__buffering-dots {
    filter: ${({ theme }) => `invert(${theme.mode === 'light' ? 0 : 1})`};
  }
`;

interface IPlainModal {
  hideModal: () => void;
  title: string;
  text?: string;
  children?: React.ReactNode;
  cancelButton?: {
    text?: string;
    onClick?: (() => boolean) | (() => Promise<boolean>);
    color?: colorType;
    disabled?: boolean;
  } | null;
  continueButton?: {
    text?: string;
    onClick?: (() => boolean) | (() => Promise<boolean>);
    color?: colorType;
    disabled?: boolean;
  };
  isLoading?: boolean;
}

/**
 * A modal that can contain a title, text, and buttons.
 */
function PlainModal({ hideModal, ...props }: IPlainModal) {
  const theme = useTheme() as themeType;

  /**
   * When user clicks the cancel button, close the modal.
   *
   * If `props.cancelButton.onClick()` is avaialable, the modal will only be
   * closed if `props.cancelButton.onClick()` returns true.
   */
  async function handleCancelButtonClick() {
    if (props.cancelButton?.onClick) {
      await props.cancelButton.onClick();
    }
    hideModal();
  }

  /**
   * When user clicks the continue button, close the modal.
   *
   * If `props.continueButton.onClick()` is avaialable, the modal will only be
   * closed if `props.continueButton.onClick()` returns true.
   */
  async function handleContinueButtonClick() {
    if (props.continueButton?.onClick) {
      const action = await props.continueButton.onClick();
      if (action) {
        hideModal();
      }
      return;
    }
    hideModal();
  }

  // tell ReactModal that it should attach to the body element
  useEffect(() => {
    ReactModal.setAppElement('body');
  }, []);

  // get the titlebar height
  const PlainModalTitleElem = useRef<HTMLHeadingElement>(null);
  const [PlainModalTitleHeight, setPlainModalTitleHeight] = useState(67);
  useEffect(() => {
    if (typeof PlainModalTitleElem.current?.offsetHeight === 'number') {
      setPlainModalTitleHeight(PlainModalTitleElem.current?.offsetHeight);
    }
  }, [PlainModalTitleElem]);

  // get the action row height
  const ActionRowElem = useRef<HTMLDivElement>(null);
  const [ActionRowHeight, setActionRowHeight] = useState(63);
  useEffect(() => {
    if (typeof ActionRowElem.current?.offsetHeight === 'number') {
      setActionRowHeight(ActionRowElem.current?.offsetHeight);
    }
  }, [ActionRowElem]);

  /**
   * Wraps text surrounded by two asterisks in `<strong>` and returns the html string.
   */
  const bold = (text: string) => {
    const bold = /\*\*(.*?)\*\*/gm;
    const html = text.replace(bold, '<strong>$1</strong>');
    return html;
  };

  return (
    <ClassNames>
      {({ css }) => {
        return (
          <ReactModal
            isOpen
            preventScroll
            shouldCloseOnEsc
            shouldCloseOnOverlayClick
            onRequestClose={() => {
              // treat close request the same as clicking the cancel button
              handleCancelButtonClick();
            }}
            shouldReturnFocusAfterClose
            className={css`
              position: absolute;
              top: calc(50% + (${theme.dimensions.titlebar.height} / 2));
              left: 50%;
              transform: translate(-50%, -50%);
              width: 480px;
              box-sizing: border-box;
              height: fit-content;
              max-height: calc(100vh - 40px - ${theme.dimensions.titlebar.height});
              border: none;
              background: none;
              color: ${theme.color.neutral[theme.mode][1400]};
              background-color: ${theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200]};
              overflow: auto;
              border-radius: ${theme.radius};
              padding: 0;
              box-shadow: 0 11px 15px -7px rgb(0 0 0 / 20%), 0 24px 38px 3px rgb(0 0 0 / 14%),
                0 9px 46px 8px rgb(0 0 0 / 12%);
            `}
            overlayClassName={css`
              z-index: 100;
              position: fixed;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              background-color: ${Color(theme.color.neutral.light[1500]).alpha(0.6).string()};
            `}
          >
            <PlainModalTitle modalHasChildren={!!props.children} theme={theme} ref={PlainModalTitleElem}>
              {props.title}
              {props.isLoading ? (
                <IndeterminateProgress modalHasChildren={!!props.children} theme={theme} />
              ) : null}
            </PlainModalTitle>
            <PlainModalContent
              modalHasChildren={!!props.children}
              theme={theme}
              titleHeight={PlainModalTitleHeight ? PlainModalTitleHeight : 0}
              actionRowHeight={ActionRowHeight ? ActionRowHeight : 0}
            >
              {props.text ? (
                <PlainModalText theme={theme} dangerouslySetInnerHTML={{ __html: bold(props.text) }} />
              ) : props.children ? (
                <PlainModalText theme={theme}>{props.children}</PlainModalText>
              ) : null}
            </PlainModalContent>
            <ActionRow modalHasChildren={!!props.children} theme={theme} ref={ActionRowElem}>
              {props.cancelButton !== null ? (
                <Button
                  color={props.cancelButton?.color}
                  onClick={handleCancelButtonClick}
                  disabled={props.cancelButton?.disabled}
                >
                  {props.cancelButton?.text || 'Cancel'}
                </Button>
              ) : null}
              <Button
                color={props.continueButton?.color}
                onClick={handleContinueButtonClick}
                disabled={props.continueButton?.disabled}
              >
                {props.continueButton?.text || 'OK'}
              </Button>
            </ActionRow>
          </ReactModal>
        );
      }}
    </ClassNames>
  );
}

export { PlainModal };
