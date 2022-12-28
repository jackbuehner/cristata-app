import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';
import FluentIcon from '../FluentIcon';

function CenteredOfflineNotice() {
  const theme = useTheme() as themeType;

  return (
    <CenteredOfflineNoticeComponent theme={theme}>
      <FluentIcon name={'CloudOff48Regular'} />
      <div className={'lead-message-offline'}>You're offline</div>
    </CenteredOfflineNoticeComponent>
  );
}

const CenteredOfflineNoticeComponent = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 10px;
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 400;
  font-size: 15px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  > .lead-message-offline {
    font-weight: 00;
    font-size: 17px;
    letter-spacing: 0.3px;
  }
`;

export { CenteredOfflineNotice };
