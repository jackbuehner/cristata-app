import styled from '@emotion/styled/macro';
import { Person24Regular, SignOut24Regular } from '@fluentui/react-icons';
import { css, useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { Button, IconButton } from '../Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from '../Menu';
import { useDropdown } from '../../hooks/useDropdown';
import { IGridCols } from '../../App';
import { Dispatch, SetStateAction } from 'react';
import { genAvatar } from '../../utils/genAvatar';
import { ME_BASIC, ME_BASIC__TYPE } from '../../graphql/queries';
import { useQuery } from '@apollo/client';

function SidenavHeader({
  gridCols,
  homeOnly,
  ...props
}: {
  gridCols: IGridCols;
  homeOnly?: boolean;
  isNavVisibleM: [boolean, Dispatch<SetStateAction<boolean>>];
}) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavVisible, setIsNavVisible] = props.isNavVisibleM;

  const { data: profiles } = useQuery<ME_BASIC__TYPE>(ME_BASIC, { fetchPolicy: 'no-cache' });

  const [showDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left + triggerRect.width - 261,
            width: 261,
          }}
          items={[
            {
              label: (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: theme.font.headline,
                      fontWeight: 500,
                      fontSize: 20,
                      color: theme.color.neutral[theme.mode][1400],
                      marginBottom: 4,
                    }}
                  >
                    {profiles?.me?.name}
                  </span>
                  <span
                    style={{
                      fontFamily: theme.font.headline,
                      fontWeight: 400,
                      fontSize: 12,
                      color: theme.color.neutral[theme.mode][1200],
                    }}
                  >
                    {profiles?.me?.current_title || 'Employee'}
                  </span>
                  <span
                    style={{
                      fontFamily: theme.font.headline,
                      fontWeight: 400,
                      fontSize: 12,
                      color: theme.color.neutral[theme.mode][1200],
                    }}
                  >
                    {profiles?.me?.email}
                  </span>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <Button
                      icon={<Person24Regular />}
                      cssExtra={css`
                        font-weight: 400;
                        background-color: transparent;
                      `}
                      onClick={() => {
                        navigate(`/profile/${profiles?.me._id}`);
                        setIsNavVisible(false);
                      }}
                    >
                      View profile
                    </Button>
                    <Button
                      icon={<SignOut24Regular />}
                      cssExtra={css`
                        font-weight: 400;
                        background-color: transparent;
                      `}
                      color={'red'}
                      onClick={() => navigate(`/sign-out`)}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              ),
              noEffect: true,
              height: 124,
            },
          ]}
        />
      );
    },
    [profiles?.me],
    true,
    true
  );

  return (
    <Wrapper
      theme={theme}
      gridCols={gridCols}
      isHidden={homeOnly ? location.pathname !== '/' : location.pathname === '/'}
      isHome={homeOnly}
      isNavVisible={isNavVisible}
    >
      <div>
        <AppName theme={theme}>Cristata</AppName>
        <Wordmark theme={theme}>THE PALADIN</Wordmark>
      </div>
      <ButtonsWrapper>
        <IconButton
          icon={<span></span>}
          cssExtra={css`
            color: ${theme.color.neutral[theme.mode][1400]};
            background: url(${profiles?.me.photo
              ? profiles.me.photo
              : profiles?.me
              ? genAvatar(profiles?.me._id)
              : ''});
            background-position: center;
            background-size: cover;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none !important;
            box-shadow: inset 0 0 0 1.5px ${theme.color.primary[theme.mode === 'light' ? 800 : 300]};
            &:hover {
              box-shadow: 0 1.6px 3.6px 0 rgb(0 0 0 / 23%), 0 0.3px 0.9px 0 rgb(0 0 0 / 21%),
                inset 0 0 0 1.5px ${theme.color.primary[theme.mode === 'light' ? 800 : 300]};
            }
            &:active {
              box-shadow: 0 1.6px 3.6px 0 rgb(0 0 0 / 6%), 0 0.3px 0.9px 0 rgb(0 0 0 / 5%),
                inset 0 0 0 1.5px ${theme.color.primary[theme.mode === 'light' ? 800 : 300]};
            }
          `}
          onClick={showDropdown}
        />
      </ButtonsWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div<{
  theme: themeType;
  gridCols: IGridCols;
  isHidden?: boolean;
  isHome?: boolean;
  isNavVisible: boolean;
}>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'flex')};
  flex-direction: row;
  height: ${({ gridCols, isHidden, isHome }) =>
    isHome && !isHidden ? 40 : isHidden ? 0 : gridCols.sideSub > 0 ? 40 : 0}px;
  transition: height 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  width: ${({ gridCols, isHidden, isHome }) =>
    isHome ? 'auto' : isHidden || gridCols.sideSub === 0 ? 0 : 'auto'};
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-right: ${({ isHidden, isHome }) => (isHome ? 0 : isHidden ? 0 : 1)}px solid;
  border-bottom: ${({ isHidden }) => (isHidden ? 0 : 1)}px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
  white-space: nowrap;
  overflow: hidden;
  flex-shrink: 0;
  @media (max-width: 600px) {
    display: ${({ isHidden, isHome, isNavVisible }) =>
      isHome ? 'flex' : isHidden || !isNavVisible ? 'none' : 'flex'};
  }
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
