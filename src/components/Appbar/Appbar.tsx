import type { CSSProperties } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { AppbarActions as Actions, AppbarBar as Bar, AppbarName as Name } from './';

function Appbar() {
  const state = useAppSelector(({ appbar }) => appbar);

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
