import { useTheme } from '@emotion/react';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import Color from 'color';
import { useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'svelte-preprocess-react/react-router';
import { useAppSelector } from '../../redux/hooks';
import type { themeType } from '../../utils/theme/theme';
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
  const tenant = location.pathname.split('/')[1];

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
    marginRight: 16,
  };

  return (
    <Bar loading={state.loading}>
      <div style={left}>
        <Name>{state.name}</Name>
      </div>
      <div style={right}>
        <Actions color={state.color} actions={state.actions} name={state.name} showSearch={state.showSearch} />
      </div>
    </Bar>
  );
}

export { Appbar };
