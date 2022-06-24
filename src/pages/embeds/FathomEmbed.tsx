import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Spinner } from '../../components/Loading';
import { useAppDispatch } from '../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../redux/slices/appbarSlice';

function FathomEmbed() {
  const [count, setCount] = useState<number>(0);

  const URL_QUERY = gql`
    query {
      fathomDashboard
    }
  `;

  const { data } = useQuery<{ fathomDashboard: string }>(URL_QUERY);

  // configure app bar
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setAppName('Fathom Analytics'));
    dispatch(setAppLoading(false));
    dispatch(
      setAppActions([
        {
          label: 'Refresh frame',
          type: 'icon',
          icon: 'ArrowClockwise20Regular',
          action: () => setCount((count) => count + 1),
        },
        {
          label: 'Open in new window',
          type: 'icon',
          icon: 'Open20Regular',
          action: () => window.open(data?.fathomDashboard, 'fathom', 'width=1200,height=800'),
        },
      ])
    );
  }, [data?.fathomDashboard, dispatch]);

  return (
    <div style={{ overflow: 'hidden', height: '100%' }}>
      <div
        style={{
          width: 'calc(100% - 80px)',
          height: 'calc(100% - 64px)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          zIndex: 1,
        }}
      >
        <Spinner color={'neutral'} colorShade={1500} size={30} />
      </div>
      <iframe
        key={count}
        title={'fathom'}
        src={data?.fathomDashboard}
        style={{ width: '100%', height: '100%', border: 'none', zIndex: 1, position: 'relative' }}
      />
    </div>
  );
}

export { FathomEmbed };
