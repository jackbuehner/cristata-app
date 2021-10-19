/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled/macro';
import { css, useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { Button } from '../../components/Button';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { Checkmark28Regular, ErrorCircle24Regular } from '@fluentui/react-icons';
import { useEffect } from 'react';
import { db } from '../../utils/axios/db';
import useAxios from 'axios-hooks';
import { useCallback } from 'react';

function SignIn() {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const signInAction = () => {
    document.location.href = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/auth/github`;
  };

  // set document title
  useEffect(() => {
    document.title = `Cristata`;
  }, []);

  const [{ data: user }, refetchUser] = useAxios({
    url: '/auth',
    baseURL: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}`,
    withCredentials: true,
    method: 'GET',
  });

  const [step, setStep] = useState<
    'notice' | '2fa_check' | '2fa_enable' | '2fa_yes' | 'join_attempt' | 'join_success' | 'join_fail' | 'done'
  >('notice');

  /**
   * Determine whether this user has two factor authentication enabled.
   */
  const is2faEnabled = useCallback(async () => {
    await refetchUser();
    if (user) {
      return user.two_factor_authentication;
    }
    return false;
  }, [user, refetchUser]);

  /**
   * Attempt to join the org, and redirect the user to the correct step after a response is received
   */
  const attemptOrgJoin = () => {
    db.post('/gh/org/invite')
      .then(() => setStep('join_success'))
      .catch(() => setStep('join_fail'));
  };

  // on the check step, determine whether 2fa is enabled and change to the next appropriate step
  useEffect(() => {
    if (step === '2fa_check') {
      setTimeout(async () => {
        if (await is2faEnabled()) {
          setStep('2fa_yes');
        } else {
          setStep('2fa_enable');
        }
      }, 1000);
    }
  }, [step, setStep, is2faEnabled]);

  if (query.get('isMember') === 'false') {
    // step that notifies the user that they need to join the organization
    if (step === 'notice') {
      return (
        <Wrapper theme={theme}>
          <Box theme={theme}>
            <div>
              <Wordmark theme={theme}>The Paladin</Wordmark>
            </div>
            <div style={{ marginTop: 34 }}>
              <p>
                It looks like you aren't part of the <i>The Paladin</i> on GitHub. Let's try to fix that.
              </p>
              <p>There are a few steps we need to take:</p>
              <ol>
                <li>Ensure you have two-factor authentication enabled.</li>
                <li>Send you an invite to the organization.</li>
                <li>Accept the invite and ensure you have the correct permissions.</li>
              </ol>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                position: 'absolute',
                width: 'calc(100% - 90px)',
                left: 45,
                bottom: 35,
              }}
            >
              <Button onClick={() => setStep('2fa_check')}>Continue</Button>
            </div>
          </Box>
        </Wrapper>
      );
    }

    // step that checks if the user has two factor authentication
    if (step === '2fa_check') {
      return (
        <Wrapper theme={theme}>
          <Box theme={theme}>
            <div>
              <Wordmark theme={theme}>The Paladin</Wordmark>
            </div>
            <div style={{ marginTop: 60, textAlign: 'center' }}>
              <Spinner theme={theme} />
              <p>Checking if your account has two-factor authentication enabled</p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'absolute',
                width: 'calc(100% - 90px)',
                left: 45,
                bottom: 35,
              }}
            >
              <Button onClick={() => setStep('notice')}>Back</Button>
              <Button disabled onClick={() => setStep('2fa_enable')}>
                Continue
              </Button>
            </div>
          </Box>
        </Wrapper>
      );
    }

    // step to tell user to enable 2fa
    if (step === '2fa_enable') {
      return (
        <Wrapper theme={theme}>
          <Box theme={theme}>
            <div>
              <Wordmark theme={theme}>The Paladin</Wordmark>
            </div>
            <div style={{ marginTop: 34 }}>
              <p>You need to enable two factor authentication (2fa).</p>
              <p>
                Go to{' '}
                <a href={`https://github.com/settings/security`} target={`_blank`}>
                  Account Security
                </a>{' '}
                and click <b>Enable two-factor authentication.</b>
              </p>
              <p>You need to have Duo or another 2fa app installed to enable 2fa.</p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'absolute',
                width: 'calc(100% - 90px)',
                left: 45,
                bottom: 35,
              }}
            >
              <Button onClick={() => setStep('notice')}>Back</Button>
              <Button onClick={() => setStep('2fa_check')}>Check again</Button>
            </div>
          </Box>
        </Wrapper>
      );
    }

    // step that tells the user two factor authentication is enabled
    if (step === '2fa_yes') {
      return (
        <Wrapper theme={theme}>
          <Box theme={theme}>
            <div>
              <Wordmark theme={theme}>The Paladin</Wordmark>
            </div>
            <div style={{ marginTop: 60, textAlign: 'center' }}>
              <Checkmark28Regular />
              <p>Your account has two-factor authentication enabled!</p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'absolute',
                width: 'calc(100% - 90px)',
                left: 45,
                bottom: 35,
              }}
            >
              <Button onClick={() => setStep('notice')}>Back</Button>
              <Button onClick={() => setStep('join_attempt')}>Continue</Button>
            </div>
          </Box>
        </Wrapper>
      );
    }

    // atempt to join the organization
    if (step === 'join_attempt') {
      attemptOrgJoin();
      return (
        <Wrapper theme={theme}>
          <Box theme={theme}>
            <div>
              <Wordmark theme={theme}>The Paladin</Wordmark>
            </div>
            <div style={{ marginTop: 60, textAlign: 'center' }}>
              <Spinner theme={theme} />
              <p>
                Attempting to join <i>The Paladin</i> on GitHub
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'absolute',
                width: 'calc(100% - 90px)',
                left: 45,
                bottom: 35,
              }}
            >
              <Button onClick={() => setStep('2fa_check')}>Back</Button>
              <Button onClick={() => setStep('join_attempt')}>Continue</Button>
            </div>
          </Box>
        </Wrapper>
      );
    }

    // join attempt failed
    if (step === 'join_fail') {
      return (
        <Wrapper theme={theme}>
          <Box theme={theme}>
            <div>
              <Wordmark theme={theme}>The Paladin</Wordmark>
            </div>
            <div style={{ marginTop: 60, textAlign: 'center' }}>
              <ErrorCircle24Regular />
              <p>There was an error inviting you to the organization.</p>
              <HelpLink theme={theme} href={`mailto:jack.buehner@thepaladin.news`}>
                Contact Web Editor
              </HelpLink>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                position: 'absolute',
                width: 'calc(100% - 90px)',
                left: 45,
                bottom: 35,
              }}
            >
              <Button onClick={() => setStep('2fa_yes')}>Back</Button>
            </div>
          </Box>
        </Wrapper>
      );
    }

    // join attempt was a success
    if (step === 'join_success') {
      return (
        <Wrapper theme={theme}>
          <Box theme={theme}>
            <div>
              <Wordmark theme={theme}>The Paladin</Wordmark>
            </div>
            <div style={{ marginTop: 44, textAlign: 'center' }}>
              <Checkmark28Regular />
              <p>
                Your account has been invited to <i>The Paladin</i>! <br></br> Please check your email to accept
                the invitation. <br></br> <br></br> Come back to the sign in page once you have accepted the
                invitation.
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'absolute',
                width: 'calc(100% - 90px)',
                left: 45,
                bottom: 35,
              }}
            >
              <Button onClick={() => setStep('2fa_yes')}>Back</Button>
              <Button onClick={() => setStep('done')}>Finish</Button>
            </div>
          </Box>
        </Wrapper>
      );
    }
  }

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

const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 28px !important;
  height: 28px !important;
  color: ${({ theme }) => theme.color.primary[900]} !important;
`;

const Wrapper = styled.div<{ theme: themeType }>`
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0px;
  z-index: 999;
  background-color: ${({ theme }) => theme.color.primary[800]};
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
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
  min-height: 260px;
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
