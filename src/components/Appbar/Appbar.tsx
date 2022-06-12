import { AppGeneric20Regular } from '@fluentui/react-icons';
import { CSSProperties } from 'react';
import { useAppSelector } from '../../redux/hooks';
import {
  AppbarAccountMenu as AccountMenu,
  AppbarActions as Actions,
  AppbarBar as Bar,
  AppbarIcon as Icon,
  AppbarName as Name,
} from './';

function Appbar() {
  const state = useAppSelector(({ appbar }) => appbar);

  const left: CSSProperties = {
    flexGrow: 1,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  };

  const right: CSSProperties = {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  };

  return (
    <Bar loading={state.loading}>
      <div style={left}>
        <Icon icon={state.icon || AppGeneric20Regular} color={state.color} />
        <Name>{state.name}</Name>
      </div>
      <div style={right}>
        <Actions color={state.color} actions={state.actions} />
        <AccountMenu />
      </div>
    </Bar>
  );
}

export { Appbar };
