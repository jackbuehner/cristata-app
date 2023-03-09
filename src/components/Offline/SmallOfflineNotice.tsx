import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { themeType } from '../../utils/theme/theme';
import FluentIcon from '../FluentIcon';

function SmallOfflineNotice() {
  const theme = useTheme() as themeType;

  return (
    <SmallOfflineNoticeComponent theme={theme}>
      <FluentIcon name={'CloudOff24Regular'} />
      <div className={'lead-message-offline'}>You're offline</div>
    </SmallOfflineNoticeComponent>
  );
}

const SmallOfflineNoticeComponent = styled.div<{ theme: themeType }>`
  margin: 20px;
  padding: 20px;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[200])};
  border-radius: ${({ theme }) => theme.radius};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: calc(100% - 82px);
  height: auto;
  gap: 10px;
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  > .lead-message-offline {
    font-weight: 00;
    font-size: 15px;
    letter-spacing: 0.3px;
  }
`;

export { SmallOfflineNotice };
