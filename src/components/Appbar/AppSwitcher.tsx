import { css, useTheme } from '@emotion/react';
import { useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { useDropdown } from '../../hooks/useDropdown';
import { useNavigationConfig } from '../../hooks/useNavigationConfig';
import type { AppbarState } from '../../redux/slices/appbarSlice';
import type { colorType, themeType } from '../../utils/theme/theme';
import { Button, IconButton } from '../Button';
import FluentIcon from '../FluentIcon';
import { Menu } from '../Menu';

interface AppSwitcherProps {
  actions: AppbarState['actions'];
  color: colorType;
}

function AppSwitcher(props: AppSwitcherProps) {
  const theme = useTheme() as themeType;
  const [mainNav] = useNavigationConfig('main');
  const tenant = location.pathname.split('/')[1];

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  // dropdown for app switcher
  const [showDropdown] = useDropdown(
    (triggerRect, dropdownRef, _, { navigate, close }) => {
      return (
        <Menu
          ref={dropdownRef}
          onEscape={close}
          afterClick={close}
          pos={{
            top: triggerRect.top + 30,
            left: triggerRect.right - 150,
            width: 150,
          }}
          items={
            mainNav?.map((item) => {
              return {
                label: item.label,
                icon: <FluentIcon name={item.icon} />,
                color: props.color,
                onClick: () => navigate(`/${tenant}${item.to}`),
              };
            }) || []
          }
        />
      );
    },
    [mainNav],
    true,
    true
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          marginLeft: 20,
          paddingLeft: window.name === '' ? 20 : 0,
          height: 30,
          borderLeft:
            props.actions.length > 0
              ? `1px solid ${
                  isCustomTitlebarVisible
                    ? theme.color.neutral['light'][800]
                    : theme.color.neutral[theme.mode][300]
                }`
              : `none`,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {window.name === '' ? (
          props.actions.length > 0 ? (
            <IconButton
              icon={<FluentIcon name={'AppFolder20Regular'} />}
              onClick={showDropdown}
              color={props.color}
              data-tip={'View all Cristata apps'}
              data-delay-show={0}
              data-effect={'solid'}
              data-place={'bottom'}
              data-offset={`{ 'bottom': 4 }`}
              forcedThemeMode={isCustomTitlebarVisible ? 'dark' : undefined}
              cssExtra={css`
                -webkit-app-region: no-drag;
                app-region: no-drag;
              `}
            />
          ) : (
            <Button
              icon={<FluentIcon name={'AppFolder20Regular'} />}
              onClick={showDropdown}
              color={props.color}
              data-tip={'View all Cristata apps'}
              data-delay-show={0}
              data-effect={'solid'}
              data-place={'bottom'}
              data-offset={`{ 'bottom': 4 }`}
              forcedThemeMode={isCustomTitlebarVisible ? 'dark' : undefined}
              cssExtra={css`
                -webkit-app-region: no-drag;
                app-region: no-drag;
              `}
            >
              Apps
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}

export { AppSwitcher };
