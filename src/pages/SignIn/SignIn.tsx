/** @jsxImportSource @emotion/react */
import { ApolloError, useApolloClient } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Checkmark28Regular, Mail48Regular } from '@fluentui/react-icons';
import { LinearProgress } from '@rmwc/linear-progress';
import Color from 'color';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Titlebar } from '../../components/Titlebar';
import {
  CHANGE_USER_PASSWORD,
  CHANGE_USER_PASSWORD__TYPE,
  MIGRATE_USER_ACCOUNT,
  MIGRATE_USER_ACCOUNT__TYPE,
  USER_EXISTS,
  USER_EXISTS__TYPE,
  USER_METHODS,
  USER_METHODS__TYPE,
} from '../../graphql/queries';
import useScript from '../../hooks/useScript';
import { themeType } from '../../utils/theme/theme';
import { PasswordMeter } from 'password-meter';
import { server } from '../../utils/constants';

interface ISignIn {
  view?: 'sign-in';
  user: any;
  loadingUser: boolean;
}

function SignIn({ user, loadingUser }: ISignIn) {
  const theme = useTheme() as themeType;
  const client = useApolloClient();
  const { pathname, search, hash, ...location } = useLocation();
  const locState = location.state as { username?: string; step?: string };
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // error message
  const [cred, setCred] = useState<{ username?: string; password?: string }>(); // collection credentials
  const [newPassCred, setNewPassCred] = useState<{
    old?: string;
    new?: string;
    newConfirm?: string;
    hideOld?: true;
  }>();
  const tenant = localStorage.getItem('tenant');

  // always reset locState undefined if username is missing in cred AND the user is not signed in
  // (this component might be loaded to enable 2fa or change a password)
  useEffect(() => {
    if (!cred?.username && !user && !loadingUser) {
      navigate(pathname + search + hash, { state: {} });
    }
  }, [cred?.username, hash, navigate, loadingUser, pathname, search, user]);

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  // nodegarden
  useScript('./scripts/nodegarden.js', 'nodegardenscript', () => null);

  /**
   * Refresh the page to reload the app with new credentials.
   */
  const done = () => {
    window.location.reload();
  };

  /**
   * Check that a username exists and can be used to sign in.
   *
   * Redirect the the password page if the username exists and it can be used
   * to sign in. Otherwise, display an appropriate error:
   *
   * - Username does not exist (doesn't exist)
   * - Could not find username (unknown error)
   * - Could not confirm username status (unknown error checking login methods)
   * @param username
   */
  const checkUsername = useCallback(
    (username: string, searchParams?: URLSearchParams) => {
      (async () => {
        setError(null);
        setIsLoading(true);

        // check that the user exists
        const res = await client.query<USER_EXISTS__TYPE>({
          query: USER_EXISTS,
          variables: { username },
          fetchPolicy: 'network-only',
        });

        // the user exists
        if (res.data?.userExists.exists) {
          const user = res.data.userExists.doc;
          // check the login methods
          const methodsRes = await client.query<USER_METHODS__TYPE>({
            query: USER_METHODS,
            variables: { username },
            fetchPolicy: 'network-only',
          });
          // the user can sign in with a password
          if (methodsRes.data?.userMethods.includes('local')) {
            navigate(pathname + (searchParams || search) + hash, {
              state: {
                username: user ? user.email || user.slug + '@thepaladin.news' : username,
                step: 'password',
              },
            });
          }
          // unknown error
          else if (methodsRes.error) setError('Could not confirm username status');
          // local password method not enabled (need to use GitHub sign-in)
          else setError(`Your account cannot sign in with a password. Try a different sign-in method.`);
        }
        // user does not exist
        else if (res.data) setError('Username does not exist');
        // unknown error
        else if (res.error) setError('Could not find username');
        setIsLoading(false);
      })();
    },
    [client, hash, navigate, pathname, search]
  );

  /**
   * Signs in by submitting the credentials to the server.
   * If successful, redirect to app.
   * If failure, display message.
   * If 2fa code requested, move to 2fa step.
   */
  const signInWithCredentials = useCallback(
    (pcred: typeof cred = cred, searchParams?: URLSearchParams) => {
      fetch(`${server.location}/auth/local?tenant=${tenant}`, {
        method: 'post',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: pcred?.username,
          password: pcred?.password,
          redirect: false,
        }),
        redirect: 'follow',
        cache: 'no-cache',
      })
        .then(async (res) => {
          const json = await res.json();
          if (json.error) setError(json.error);
          else if (json.data) {
            setError(null);
            // need to change password
            if (json.data.next_step === 'change_password') {
              setNewPassCred({ ...newPassCred, old: pcred?.password, hideOld: true });
              navigate(pathname + (searchParams || search) + hash, {
                state: {
                  ...locState,
                  step: 'change_password',
                },
              });
            }
            // TODO: read whether two_factor_authentication is enabled and require the user to enable it
            // reload to continue to app
            else {
              done();
            }
          } else setError('Failed to authenticate successfully');
        })
        .catch((error) => {
          console.error(error);
          setError('An unexpected error occured');
        });
    },
    [cred, tenant, newPassCred, navigate, pathname, search, hash, locState]
  );

  /**
   * Changes the password for the user
   */
  const changePassword = () => {
    setError(null);
    setIsLoading(true);

    if (newPassCred?.new !== newPassCred?.newConfirm) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    client
      .mutate<CHANGE_USER_PASSWORD__TYPE>({
        mutation: CHANGE_USER_PASSWORD,
        variables: {
          oldPassword: newPassCred?.old,
          newPassword: newPassCred?.new,
        },
      })
      .then(() => {
        setError(null);
        navigate(pathname + search + hash, {
          state: {
            ...locState,
            step: 'change_password_success',
          },
        });
      })
      .catch((error: ApolloError) => {
        console.error(error);
        if (error.message === 'Password or username is incorrect') setError('Incorrect old password');
        else setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // If the username [ue] and password [pe] (optional) are included in the url
  // params, move them to state and remove them from the url
  // and attempt to sign in.
  // NOTE: Username and password must be b64 encoded.
  useEffect(() => {
    if (search !== '' && search !== '?' && locState === null) {
      const searchParams = new URLSearchParams(search);

      const username = searchParams.get('ue') || undefined;
      const password = searchParams.get('pe') || undefined;

      searchParams.delete('ue');
      searchParams.delete('pe');

      // if username and password are present, attempt to sign in
      if (username && password) {
        setCred({ username: atob(username), password: atob(password) });
        signInWithCredentials({ username: atob(username), password: atob(password) }, searchParams);
      }

      // if only username is present, only set the username
      // and proceed to the password step
      else if (username) {
        setCred({ username: atob(username) });
        checkUsername(atob(username), searchParams);
      }
    }
  }, [checkUsername, locState, search, signInWithCredentials]);

  // set document title
  useEffect(() => {
    document.title = `Cristata`;
  }, []);

  /**
   * Migrates a user's account to a local account. Social sign on will still
   * work after the migration.
   */
  const migrateAccount = (_id: string) => {
    setError(null);
    setIsLoading(true);

    client
      .mutate<MIGRATE_USER_ACCOUNT__TYPE>({
        mutation: MIGRATE_USER_ACCOUNT,
        variables: { _id },
      })
      .then(() => {
        navigate(pathname + search + hash, {
          state: {
            ...locState,
            step: 'migrate_email_sent',
          },
        });
      })
      .catch((error: ApolloError) => {
        console.error(error);
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * Execute `nextFunction()` when the `Enter` key is pressed.
   *
   * Add this function to the `onKeyPress` prop to activate it.
   */
  const nextOnEnter = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.code === 'Enter') {
      //nextFunction();
    }
  };

  // set the template variables
  let nextFunction: () => void = () =>
    !cred?.username ? setError('Enter an email or username') : checkUsername(cred.username);
  let title: string = 'Sign in';
  let reason: string = 'to continue to Cristata';
  let form: JSX.Element = (
    <>
      <TextInput
        lineHeight={'24px'}
        placeholder={'Username'}
        value={cred?.username}
        onChange={(e) => setCred({ ...cred, username: e.currentTarget.value })}
        onKeyPress={nextOnEnter}
        id={`username`}
        name={`username`}
        autocomplete={`username`}
        autoFocus
      />
      {/* hidden password field makes some browser autofill the username */}
      <div style={{ display: 'none' }}>
        <TextInput
          lineHeight={'24px'}
          placeholder={'Password'}
          value={cred?.password || ''}
          onChange={(e) => setCred({ ...cred, password: e.currentTarget.value })}
          onKeyPress={nextOnEnter}
          type={'password'}
          id={`password`}
          name={`password`}
          autocomplete={`current-password`}
        />
      </div>
      {error ? <ErrorMessage theme={theme}>{error}</ErrorMessage> : null}
      <HelpLink theme={theme} href={`mailto:jack.buehner@thepaladin.news`}>
        Need account?
      </HelpLink>
    </>
  );
  let note: JSX.Element = (
    <>
      <HelpNote theme={theme}>Having problems signing in? Request help from the Digitial Director.</HelpNote>
      <HelpLink theme={theme} href={`mailto:jack.buehner@thepaladin.news`}>
        Contact Digital Director
      </HelpLink>
    </>
  );
  let buttons: JSX.Element = <Button onClick={nextFunction}>Next</Button>;
  let below: JSX.Element = <></>;

  // set the template variables for the password step
  if (locState?.step === 'password') {
    title = 'Welcome back';
    if (locState?.username && typeof locState.username === 'string') reason = locState.username;
    nextFunction = () =>
      !cred?.password || cred.password.length === 0 ? setError('Enter your password') : signInWithCredentials();
    form = (
      <>
        {/* hidden username field for accessiblity */}
        <div style={{ display: 'none' }}>
          <TextInput
            lineHeight={'24px'}
            placeholder={'Username'}
            value={cred?.username}
            onChange={(e) => setCred({ ...cred, username: e.currentTarget.value })}
            onKeyPress={nextOnEnter}
            id={`username`}
            name={`username`}
            autocomplete={`username`}
            autoFocus
          />
        </div>
        {/* password field */}
        <TextInput
          lineHeight={'24px'}
          placeholder={'Password'}
          value={cred?.password || ''}
          onChange={(e) => setCred({ ...cred, password: e.currentTarget.value })}
          onKeyPress={nextOnEnter}
          type={'password'}
          id={`password`}
          name={`password`}
          autocomplete={`current-password`}
          autoFocus
        />
        {error ? <ErrorMessage theme={theme}>{error}</ErrorMessage> : null}
      </>
    );
    note = <></>;
    buttons = (
      <>
        <HelpLink theme={theme} href={`mailto:jack.buehner@thepaladin.news`}>
          Forgot password?
        </HelpLink>
        <Button onClick={nextFunction}>Next</Button>
      </>
    );
    below = <></>;
  }

  // set the template variables for the change_password step
  if (locState?.step === 'change_password') {
    const { percent } = new PasswordMeter().getResult(newPassCred?.new || '');
    title = 'Change password';
    if (locState?.username && typeof locState.username === 'string') reason = locState.username;
    nextFunction = () =>
      !newPassCred?.old || newPassCred.old.length === 0
        ? setError('Enter your existing password')
        : !newPassCred?.new ||
          !newPassCred?.newConfirm ||
          newPassCred.new.length === 0 ||
          newPassCred.newConfirm.length === 0
        ? setError('Enter your new password in both inputs')
        : changePassword();
    form = (
      <>
        {/* hidden username field for accessiblity */}
        <div style={{ display: 'none' }}>
          <TextInput
            lineHeight={'24px'}
            placeholder={'Username'}
            value={cred?.username}
            onChange={(e) => setCred({ ...cred, username: e.currentTarget.value })}
            onKeyPress={nextOnEnter}
            id={`username`}
            name={`username`}
            autocomplete={`username`}
            autoFocus
          />
        </div>
        {/* old password */}
        {newPassCred?.hideOld ? null : (
          <TextInput
            lineHeight={'24px'}
            placeholder={'Current password'}
            value={newPassCred?.old || ''}
            onChange={(e) => setNewPassCred({ ...newPassCred, old: e.currentTarget.value })}
            onKeyPress={nextOnEnter}
            type={'password'}
            name={`password`}
            id={`password`}
            autocomplete={`current-password`}
            autoFocus
          />
        )}
        {/* new password */}
        <TextInput
          lineHeight={'24px'}
          placeholder={'New password'}
          value={newPassCred?.new || ''}
          onChange={(e) => setNewPassCred({ ...newPassCred, new: e.currentTarget.value })}
          onKeyPress={nextOnEnter}
          type={'password'}
          name={`new-password`}
          id={`new-password`}
          autocomplete={`new-password`}
          autoFocus={!newPassCred?.hideOld}
        />
        <Meter percent={percent} />
        {/* confirm password */}
        <TextInput
          lineHeight={'24px'}
          placeholder={'Re-type new password'}
          value={newPassCred?.newConfirm || ''}
          onChange={(e) => setNewPassCred({ ...newPassCred, newConfirm: e.currentTarget.value })}
          onKeyPress={nextOnEnter}
          type={'password'}
          name={`new-password-again`}
          id={`new-password-again`}
          autocomplete={`new-password`}
        />
        {percent < 70 && percent > 0 ? (
          <ErrorMessage theme={theme}>
            Password is too weak. Try adding some numbers, symbols, or uppercase letters.
          </ErrorMessage>
        ) : null}
        {error ? <ErrorMessage theme={theme}>{error}</ErrorMessage> : null}
      </>
    );
    note = <></>;
    buttons = (
      <>
        <Button onClick={nextFunction}>Change</Button>
      </>
    );
    below = <></>;
  }

  // template for change_password_success step
  if (locState?.step === 'change_password_success') {
    title = 'Change password';
    if (locState?.username && typeof locState.username === 'string') reason = locState.username;
    nextFunction = () => done();
    form = (
      <>
        <div style={{ marginTop: 44, textAlign: 'center' }}>
          <Checkmark28Regular />
          <p>Your password has been changed.</p>
        </div>
      </>
    );
    note = <></>;
    buttons = (
      <>
        <Button onClick={nextFunction} autoFocus>
          Finish
        </Button>
      </>
    );
    below = <></>;
  }

  // template for migrate_to_local step
  if (locState?.step === 'migrate_to_local') {
    title = 'Hey!';
    reason = '';
    nextFunction = () => {
      if (user?._id) migrateAccount(user._id);
      else setError('_id or user is not defined');
    };
    form = (
      <>
        <div style={{ textAlign: 'center' }}>
          {error ? <ErrorMessage theme={theme}>{error}</ErrorMessage> : null}
          <p>We migrated to a new account system, but you haven't created a password for your account!</p>
          <p>To continue using Cristata, we need you to set a password.</p>
          <p>You will receive an email at {user?.email || 'null'} with a link to create a new password.</p>
          <p
            style={{
              fontWeight: 600,
              margin: 0,
              padding: 10,
              borderRadius: theme.radius,
              backgroundColor: Color(theme.color.danger[800]).alpha(0.1).string(),
            }}
          >
            If you do not click the link in the email within 48 hours, you will lose access to your account.
          </p>
          <p>
            Click <span style={{ fontWeight: 500 }}>Next</span> to receive the email.
          </p>
        </div>
      </>
    );
    note = <></>;
    buttons = (
      <>
        <Button onClick={nextFunction} autoFocus>
          Next
        </Button>
      </>
    );
    below = <></>;
  }

  // template for migrate_email_sent step (after migrate_to_local email is sent)
  if (locState?.step === 'migrate_email_sent') {
    title = '';
    reason = '';
    nextFunction = () => null;
    form = (
      <>
        <div style={{ marginTop: 58, textAlign: 'center' }}>
          <Mail48Regular />
          <p>
            An email has been sent.
            <br />
            Check your inbox.
          </p>
        </div>
      </>
    );
    note = <></>;
    buttons = <></>;
    below = <></>;
  }

  return (
    <>
      {isCustomTitlebarVisible ? <Titlebar /> : null}
      <Wrapper theme={theme}>
        <Box theme={theme}>
          {isLoading ? <IndeterminateProgress theme={theme} /> : null}
          <div>
            <Wordmark theme={theme}>The Paladin</Wordmark>
            <Title theme={theme}>{title}</Title>
            <Reason theme={theme}>{reason}</Reason>
          </div>
          <Form theme={theme}>{form}</Form>
          <Help>{note}</Help>
          <ButtonRow>{buttons}</ButtonRow>
          <Below>{below}</Below>
        </Box>
        <div
          id={'nodegardencontainer'}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden', zIndex: -1 }}
        ></div>
      </Wrapper>
    </>
  );
}

const Below = styled.div`
  position: absolute;
  top: 100%;
  padding: 10px 0;
  width: calc(100% - 80px);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  @media (max-width: 460px) {
    width: 100%;
    left: 0px;
    background-color: black;
  }
`;

const ErrorMessage = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 0.85rem;
  color: ${({ theme }) => theme.color.danger[700]};
  display: flex;
  &::before {
    content: '⚠';
    margin-right: 6px;
  }
`;

const Wrapper = styled.div<{ theme: themeType }>`
  height: calc(100% - env(titlebar-area-height, 0px));
  width: 100%;
  position: absolute;
  left: 0px;
  z-index: 999;
  background-color: ${({ theme }) => (theme.mode === 'light' ? theme.color.primary[800] : 'black')};
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
`;

const Box = styled.div<{ theme: themeType }>`
  position: absolute;
  z-index: 10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: block;
  width: 310px;
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  box-shadow: rgb(0 0 0 / 14%) 0px 2px 2px 0px, rgb(0 0 0 / 12%) 0px 1px 5px 0px,
    rgb(0 0 0 / 20%) 0px 3px 1px -2px;
  padding: 50px 40px 40px 40px;
  box-sizing: content-box;
  border-radius: ${({ theme }) => theme.radius};
  @media (max-width: 460px) {
    positon: fixed;
    inset: 0;
    transform: none;
    width: unset;
    border-radius: 0;
  }
  min-height: 360px;
  user-select: none;
`;

const Wordmark = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.wordmark};
  font-weight: 600;
  font-size: 2rem;
  line-height: 1.5rem;
  color: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
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

const Form = styled.form<{ theme: themeType }>`
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 24px 0px;
  > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Help = styled.div`
  margin: 0;
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
  color: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
`;

const ButtonRow = styled.div`
  margin: 36px 0 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;

  > *:only-child {
    margin-left: auto;
  }
`;

/**
 * The indeterminate progressbar that appears by the modal title when `isLoading` is `true`.
 *
 * It appears underneath the title when there are children, and it appears at the top of the modal
 * when there are no children
 */
const IndeterminateProgress = styled(LinearProgress)<{
  theme: themeType;
}>`
  --mdc-theme-primary: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
  position: absolute !important;
  left: 0;
  top: 0;
  border-radius: ${({ theme }) => `${theme.radius} ${theme.radius} 0 0`};
  @media (max-width: 460px) {
    border-radius: 0;
  }
  .mdc-linear-progress__buffer {
    background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  }
  .mdc-linear-progress__buffering-dots {
    filter: ${({ theme }) => `invert(${theme.mode === 'light' ? 0 : 1})`};
  }
`;

const Meter = styled.div<{ percent: number }>`
  margin-top: -8px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 2.1px;
    background: ${({ percent }) =>
      percent === 0
        ? 'none'
        : percent < 50
        ? Color(`rgb(255, ${Math.round(5.1 * percent)}, 0)`)
            .darken(0.1)
            .string()
        : Color(`rgb(${Math.round(510 - 5.1 * percent)}, 255, 0)`)
            .darken(0.3)
            .string()};
    border-radius: 2px;
  }
`;

export { SignIn };
