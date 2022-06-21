import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../components/Modal';
import { IPlainModal } from '../../components/Modal/PlainModal';
import { themeType } from '../../utils/theme/theme';
import { useWindow } from '../useWindow';
import { UseWindowOptions } from '../useWindow/useWindow';

type UseWindowModal = [Modal: false | React.ReactNode, openWindow: () => void, closeWindow: () => void];

interface UseWindowModalProps extends Omit<IPlainModal, 'hideModal'> {
  windowOptions?: UseWindowOptions;
}

function useWindowModal(
  _props: UseWindowModalProps | (() => UseWindowModalProps),
  deps?: any[]
): UseWindowModal {
  let props: UseWindowModalProps;
  if (typeof _props === 'function') props = _props();
  else props = _props;

  const theme = useTheme() as themeType;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  const [Window, openWindow, closeWindow] = useWindow(
    <WindowWrapper theme={theme} styleString={props.styleString}>
      <PlainModal noModalComponent hideModal={() => closeWindow()} {...props} />
    </WindowWrapper>,
    { height: props.children ? 600 : 186, ...props.windowOptions }
  );

  const [showModal, hideModal] = useModal(
    () => <PlainModal hideModal={() => hideModal()} {...props} />,
    [...(deps || []), props.children]
  );

  const open = () => {
    if (isCustomTitlebarVisible) openWindow();
    else showModal();
  };

  const close = () => {
    if (isCustomTitlebarVisible) closeWindow();
    else hideModal();
  };

  return [Window, open, close];
}

const WindowWrapper = styled.div<{ theme: themeType; styleString?: string }>`
  width: 100%;
  height: 100%;
  border: none;
  background: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200])};
  overflow: auto;
  border-radius: ${({ theme }) => theme.radius};
  padding: 0;
  display: flex;
  flex-direction: column;
  outline: none !important;
  ${({ styleString }) => styleString}
`;

export { useWindowModal };
