import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { LinearProgress } from '@rmwc/linear-progress';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Titlebar } from '../../components/Titlebar';
import useScript from '../../hooks/useScript';
import { server } from '../../utils/constants';
import { themeType } from '../../utils/theme/theme';

interface PickTenantProps {
  tenant: string;
  setTenant: Dispatch<SetStateAction<string>>;
}

function PickTenant(props: PickTenantProps) {
  const theme = useTheme() as themeType;

  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  // nodegarden
  useScript('./scripts/nodegarden.js', 'nodegardenscript', () => null);

  const checkTenantExists = useCallback(
    async (tenant?: string): Promise<void> => {
      setLoading(true);

      const res = await fetch(`${server.location}/v3/${tenant || value}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `query { userPublic(_id: "000000000000000000000000") { _id } }` }),
      });

      setLoading(false);

      if (res.status !== 200)
        throw new Error('This tenant does not exist. Ask your supervisor for the correct tenant name.');
    },
    [value]
  );

  useEffect(() => {
    if (!props.tenant && window.location.pathname.length > 1) {
      const parts = window.location.pathname.split('/');
      const possibleTenant = parts[1];
      checkTenantExists(possibleTenant)
        .then(() => {
          props.setTenant(possibleTenant);
          localStorage.setItem('tenant', possibleTenant);
        })
        .catch(() => {
          setValue('');
          setLoading(false);
        });
    } else {
      setValue('');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on first mount

  return (
    <>
      {isCustomTitlebarVisible ? <Titlebar /> : null}
      <Wrapper theme={theme}>
        <Box theme={theme}>
          {loading ? <IndeterminateProgress theme={theme} /> : null}
          {value !== null ? (
            props.tenant ? (
              <Reason theme={theme}>Redirecting to your tenant</Reason>
            ) : (
              <>
                <Title theme={theme}>Specify your tenant</Title>
                <Reason theme={theme}>to continue to Cristata</Reason>
                <Form theme={theme}>
                  <TextInput
                    lineHeight={'24px'}
                    placeholder={'Type your tenant name'}
                    value={value}
                    onChange={(e) => setValue(e.currentTarget.value)}
                  />
                  {error ? <ErrorMessage theme={theme}>{error}</ErrorMessage> : null}
                </Form>
                <ButtonRow theme={theme}>
                  <Button
                    onClick={() => {
                      checkTenantExists()
                        .then(() => {
                          setError('');
                          setLoading(true);
                          props.setTenant(value);
                          localStorage.setItem('tenant', value);
                        })
                        .catch(({ message }: Error) => {
                          setError(message);
                        });
                    }}
                    autoFocus
                  >
                    Continue
                  </Button>
                </ButtonRow>
              </>
            )
          ) : (
            <Reason theme={theme}>Checking</Reason>
          )}
        </Box>
        <div
          id={'nodegardencontainer'}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
            zIndex: -1,
          }}
        />
      </Wrapper>
    </>
  );
}

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

export { PickTenant };
