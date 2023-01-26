import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { AppbarState } from '../../redux/slices/appbarSlice';
import type { colorType, themeType } from '../../utils/theme/theme';
import { Button, IconButton } from '../Button';
import FluentIcon from '../FluentIcon';
import { AppbarAppSwitcher as AppSwitcher, AppbarSearch as Search } from './';

interface ActionsProps {
  actions: AppbarState['actions'];
  color: colorType;
  name: string;
  showSearch: boolean;
}

function Actions(props: ActionsProps) {
  const theme = useTheme() as themeType;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  return (
    <>
      <ACTIONS_WRAPPER_COMPONENT theme={theme}>
        {props.showSearch ? (
          <Search color={props.color} name={props.name} />
        ) : (
          props.actions?.map(
            (
              {
                label,
                type,
                icon,
                action,
                onAuxClick,
                color,
                disabled,
                'data-tip': dataTip,
                showChevron,
                flipChevron,
              },
              index
            ) => {
              if (type === 'icon' && icon) {
                return (
                  <IconButton
                    key={index}
                    icon={<FluentIcon name={icon} />}
                    onClick={action}
                    onAuxClick={onAuxClick}
                    color={color || props.color}
                    disabled={disabled}
                    data-tip={dataTip || label}
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
                );
              }
              return (
                <Button
                  key={index}
                  icon={icon ? <FluentIcon name={icon} /> : undefined}
                  onClick={action}
                  onAuxClick={onAuxClick}
                  color={color || props.color}
                  disabled={disabled}
                  data-tip={dataTip || label}
                  data-effect={'solid'}
                  data-place={'bottom'}
                  data-offset={`{ 'bottom': 4 }`}
                  showChevron={showChevron}
                  flipChevron={flipChevron}
                  forcedThemeMode={isCustomTitlebarVisible ? 'dark' : undefined}
                  cssExtra={css`
                    -webkit-app-region: no-drag;
                    app-region: no-drag;
                  `}
                >
                  {label}
                </Button>
              );
            }
          )
        )}
      </ACTIONS_WRAPPER_COMPONENT>
    </>
  );
}

const ACTIONS_WRAPPER_COMPONENT = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  flex-grow: 0;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
`;

export { Actions };
