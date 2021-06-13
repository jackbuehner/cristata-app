/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { css, useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { Button } from '../../components/Button';

function SignIn() {
  const theme = useTheme() as themeType;

  const signInAction = () => {
    document.location.href =
      process.env.NODE_ENV === 'production'
        ? `https://api.thepaladin.cristata.app/auth/github`
        : `http://localhost:3001/auth/github`;
  };

  return (
    <Wrapper theme={theme}>
      <Box theme={theme}>
        <div>
          <Wordmark theme={theme}>The Paladin</Wordmark>
          <Title theme={theme}>Sign In</Title>
          <Reason theme={theme}>to continue to Cristata</Reason>
        </div>
        <Form>
          <Button
            width={`100%`}
            height={`3rem`}
            cssExtra={css`
              font-weight: 600;
            `}
            onClick={signInAction}
          >
            Sign in with GitHub
          </Button>
        </Form>
        <div>
          <HelpNote theme={theme}>Having problems signing in? Request help from the Web Editor.</HelpNote>
          <HelpLink theme={theme} href={`mailto:jack.buehner@thepaladin.news`}>
            Contact Web Editor
          </HelpLink>
        </div>
      </Box>
    </Wrapper>
  );
}

const Wrapper = styled.div<{ theme: themeType }>`
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0px;
  z-index: 999;
  background-color: ${({ theme }) => theme.color.primary[800]};
`;

const Box = styled.div<{ theme: themeType }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: block;
  width: 300px;
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  box-shadow: rgb(0 0 0 / 14%) 0px 2px 2px 0px, rgb(0 0 0 / 12%) 0px 1px 5px 0px,
    rgb(0 0 0 / 20%) 0px 3px 1px -2px;
  padding: 45px;
  box-sizing: content-box;
  border-radius: ${({ theme }) => theme.radius};
  @media (max-width: 460px) {
    positon: fixed;
    inset: 0;
    transform: none;
    width: unset;
  }
`;

const Wordmark = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.wordmark};
  font-weight: 600;
  font-size: 2rem;
  line-height: 1rem;
  color: ${({ theme }) => theme.color.primary[800]};
  margin: 0px;
  text-align: center;
  letter-spacing: 0.03125em;
  text-transform: uppercase;
`;

const Title = styled.p<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 400;
  font-size: 1.5rem;
  line-height: 1.75rem;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 0px 0px -2px;
  text-align: center;
  padding-top: 22px;
`;

const Reason = styled.p<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 0px;
  text-align: center;
  padding-top: 8px;
`;

const Form = styled.div`
  padding: 20px 0px;
`;

const HelpNote = styled.p<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1100]};
  font-size: 14px;
  line-height: 1.4286;
  margin: 0px 0px 10px;
`;

const HelpLink = styled.a<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.color.primary[800]};
`;

export { SignIn };
