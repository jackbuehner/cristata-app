import { gql, useQuery } from '@apollo/client';
import { ArrowClockwise16Regular, Open24Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { IconButton } from '../../components/Button';
import { Spinner } from '../../components/Loading';
import { PageHead } from '../../components/PageHead';

function FathomEmbed() {
  const [count, setCount] = useState<number>(0);

  const URL_QUERY = gql`
    query {
      fathomDashboard
    }
  `;

  const { data } = useQuery<{ fathomDashboard: string }>(URL_QUERY);

  return (
    <div style={{ overflow: 'hidden', height: '100%' }}>
      <PageHead
        title={'Fathom Analytics'}
        description={'thepaladin.news'}
        buttons={
          data?.fathomDashboard ? (
            <>
              <IconButton onClick={() => setCount((count) => count + 1)} icon={<ArrowClockwise16Regular />}>
                Refresh frame
              </IconButton>
              <IconButton
                onClick={() => window.open(data?.fathomDashboard, 'fathom', 'width=1200,height=800')}
                icon={<Open24Regular />}
              >
                Open Externally
              </IconButton>
            </>
          ) : (
            <></>
          )
        }
      />
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
        style={{ width: '100%', height: 'calc(100% - 64px)', border: 'none', zIndex: 1, position: 'relative' }}
      />
    </div>
  );
}

export { FathomEmbed };
