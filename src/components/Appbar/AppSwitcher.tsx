import { css, useTheme } from '@emotion/react';
import { AppFolder20Regular } from '@fluentui/react-icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { useDropdown } from '../../hooks/useDropdown';
import { useNavigationConfig } from '../../hooks/useNavigationConfig';
import { AppbarState } from '../../redux/slices/appbarSlice';
import { colorType, themeType } from '../../utils/theme/theme';
import { Button, IconButton } from '../Button';
import { Menu } from '../Menu';
import * as fluentIcons from '@fluentui/react-icons';
import { isFluentIconComponent } from '../../utils/isFluentIconComponent';

interface AppSwitcherProps {
  actions: AppbarState['actions'];
  color: colorType;
}

function AppSwitcher(props: AppSwitcherProps) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const [mainNav] = useNavigationConfig('main');

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  // dropdown for app switcher
  const [showDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.top + 30,
            left: triggerRect.right - 150,
            width: 150,
          }}
          items={
            mainNav?.map((item) => {
              const Icon = fluentIcons[item.icon];

              return {
                label: item.label,
                icon: isFluentIconComponent(Icon) ? <Icon /> : <span />,
                color: props.color,
                onClick: () => navigate(item.to),
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
          paddingLeft: 20,
          height: '30',
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
        {props.actions.length > 0 ? (
          <IconButton
            icon={<AppFolder20Regular />}
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
            icon={<AppFolder20Regular />}
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
        )}
      </div>
    </div>
  );
}

export { AppSwitcher };
