import styled from '@emotion/styled';
import { SignOut20Regular } from '@fluentui/react-icons';
import { css, useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { IconButton } from '../Button';
import { useHistory } from 'react-router-dom';

function SidenavHeader() {
  const theme = useTheme() as themeType;
  const history = useHistory();

  return (
    <Wrapper>
      <div>
        <AppName theme={theme}>Cristata</AppName>
        <Wordmark theme={theme}>THE PALADIN</Wordmark>
      </div>
      <ButtonsWrapper>
        <IconButton icon={<SignOut20Regular />} onClick={() => history.push(`/sign-out`)} />
        <IconButton
          icon={<img src={`https://avatars.githubusercontent.com/u/69555023`} alt={``} />}
          cssExtra={css`
            padding: 0;
            > img {
              width: 28px;
              height: 28px;
            }
          `}
        />
      </ButtonsWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
`;

const AppName = styled.span<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-weight: 500;
  font-size: 24px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  &::after {
    content: '~';
    font-family: ${({ theme }) => theme.font.detail};
    font-weight: 300;
    font-size: 24px;
    line-height: 26px;
    margin: 0 6px;
    color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  }
`;

const Wordmark = styled.span<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.wordmark};
  font-weight: 500;
  font-size: 26px;
  line-height: 27px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;

export { SidenavHeader };
