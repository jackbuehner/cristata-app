import styled from '@emotion/styled/macro';
import Color from 'color';
import { ToastContainer as ReactToastContainer } from 'react-toastify';
import { themeType } from '../../utils/theme/theme';
import { useTheme } from '@emotion/react';
import { Dismiss16Regular } from '@fluentui/react-icons';

function ToastContainer() {
  const theme = useTheme() as themeType;

  return (
    <StyledToastContainer
      appTheme={theme}
      icon={false}
      closeButton={
        <span style={{ margin: '8px 8px 0 0' }}>
          <Dismiss16Regular />
        </span>
      }
    />
  );
}

const StyledToastContainer = styled(ReactToastContainer)<{
  appTheme: themeType;
  icon?: false | React.ReactNode;
}>`
  top: ${({ appTheme }) => `calc(${appTheme.dimensions.PageHead.height} + 6px)`};
  .Toastify__toast {
    border-radius: ${({ appTheme }) => appTheme.radius};
    padding: 0;
    background-color: ${({ appTheme }) =>
      appTheme.mode === 'light' ? 'white' : appTheme.color.neutral.dark[200]};
    color: ${({ appTheme }) => appTheme.color.neutral[appTheme.mode][1400]};
    font-family: ${({ appTheme }) => appTheme.font.detail};
    font-size: 15px;
    &::before {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      background-color: ${({ appTheme }) =>
        appTheme.mode === 'light' ? 'white' : appTheme.color.neutral.dark[200]};
    }
  }
  .Toastify__toast--error {
    &::before {
      content: '❌';
      border-left: ${({ appTheme }) => `3px solid ${appTheme.color.danger[800]}`};
    }
  }
  .Toastify__toast--warning {
    &::before {
      content: '❗';
      border-left: ${({ appTheme }) => `3px solid ${appTheme.color.orange[800]}`};
    }
  }
  .Toastify__toast--success {
    &::before {
      content: '✅';
      border-left: ${({ appTheme }) => `3px solid ${appTheme.color.success[800]}`};
    }
  }
  .Toastify__toast-body {
    width: 100%;
    padding-left: 0;
  }
  .Toastify__progress-bar {
    background-color: ${({ appTheme }) =>
      Color(appTheme.color.neutral[appTheme.mode][800]).alpha(0.25).string()};
    height: 3px;
  }
`;

export { ToastContainer };
