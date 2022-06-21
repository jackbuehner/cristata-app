import { useTheme } from '@emotion/react';
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
    () => (
      <div
        style={{
          width: `100%`,
          height: `100%`,
          border: `none`,
          background: `none`,
          color: theme.color.neutral[theme.mode][1400],
          backgroundColor: theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200],
          overflow: `auto`,
          borderRadius: theme.radius,
          padding: 0,
          display: `flex`,
          flexDirection: `column`,
          outline: `none !important`,
        }}
      >
        <PlainModal noModalComponent hideModal={() => closeWindow()} {...props} />
      </div>
    ),
    { height: props.children ? 240 : 186, ...props.windowOptions }
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

export { useWindowModal };
