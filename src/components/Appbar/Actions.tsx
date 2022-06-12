import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { AppbarState } from '../../redux/slices/appbarSlice';
import { colorType, themeType } from '../../utils/theme/theme';
import { Button, IconButton } from '../Button';
import { AppbarAppSwitcher as AppSwitcher } from './';

interface ActionsProps {
  actions: AppbarState['actions'];
  color: colorType;
}

function Actions(props: ActionsProps) {
  const theme = useTheme() as themeType;

  return (
    <>
      <ACTIONS_WRAPPER_COMPONENT theme={theme}>
        {props.actions?.map(
          ({ label, type, icon: Icon, action, onAuxClick, color, disabled, 'data-tip': dataTip }, index) => {
            if (type === 'icon' && Icon) {
              return (
                <IconButton
                  icon={<Icon />}
                  onClick={action}
                  onAuxClick={onAuxClick}
                  color={color || props.color}
                  disabled={disabled}
                  data-tip={dataTip || label}
                  data-delay-show={0}
                  data-effect={'solid'}
                  data-place={'bottom'}
                  data-offset={`{ 'bottom': 4 }`}
                />
              );
            }
            return (
              <Button
                icon={Icon ? <Icon /> : undefined}
                onClick={action}
                onAuxClick={onAuxClick}
                color={color || props.color}
                disabled={disabled}
                data-tip={dataTip || label}
                data-effect={'solid'}
                data-place={'bottom'}
                data-offset={`{ 'bottom': 4 }`}
              >
                {label}
              </Button>
            );
          }
        )}
      </ACTIONS_WRAPPER_COMPONENT>
      <AppSwitcher actions={props.actions} color={props.color} />
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
