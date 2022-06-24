import { useTheme } from '@emotion/react';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import Color from 'color';
import { CSSProperties, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { themeType } from '../../utils/theme/theme';
import { Button } from '../Button';
import {
  AppbarAccountMenu as AccountMenu,
  AppbarActions as Actions,
  AppbarBar as Bar,
  AppbarIcon as Icon,
  AppbarName as Name,
} from './';

function Appbar() {
  const state = useAppSelector(({ appbar }) => appbar);
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const location = useLocation();

  const [showHomeArrow, setShowHomeArrow] = useState(false);

  const left: CSSProperties = {
    flexGrow: 0,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  };

  const right: CSSProperties = {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  };

  return (
    <Bar loading={state.loading}>
      <div style={left}>
        {location.pathname !== '/' && window.name === '' ? (
          <div
            onMouseEnter={() => setShowHomeArrow(true)}
            onMouseLeave={() => setShowHomeArrow(false)}
            style={{
              //@ts-expect-error app-region is in beta
              'app-region': 'no-drag',
              '-webkit-app-region': 'no-drag',
              padding: '9px',
              position: 'absolute',
              zIndex: 1,
              backgroundColor: Color(theme.color.neutral[theme.mode][300]).alpha(0.3).string(),
              backdropFilter: 'blur(10px)',
              transform: `translateX(${showHomeArrow ? 0 : -200}px)`,
              opacity: showHomeArrow ? 1 : 0,
              transition: `all 240ms ${!showHomeArrow ? `ease` : `cubic-bezier(0.1, 0.9, 0.2, 1)`}`,
            }}
          >
            <Button
              icon={<ArrowLeft24Regular />}
              onClick={() => {
                navigate('/');
                setShowHomeArrow(false);
              }}
            >
              Return to dashboard
            </Button>
          </div>
        ) : null}
        <Icon
          icon={state.icon || 'AppGeneric20Regular'}
          color={state.color}
          name={state.name}
          onMouseEnter={() => (location.pathname !== '/' ? setShowHomeArrow(true) : null)}
          drag={window.name !== ''}
        />
        <Name>{state.name}</Name>
      </div>
      <div style={right}>
        <Actions color={state.color} actions={state.actions} name={state.name} showSearch={state.showSearch} />
        <AccountMenu />
      </div>
    </Bar>
  );
}

export { Appbar };
