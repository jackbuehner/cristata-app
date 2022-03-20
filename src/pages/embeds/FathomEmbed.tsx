import { ArrowClockwise16Regular, Open24Regular } from '@fluentui/react-icons';
import useAxios from 'axios-hooks';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IconButton } from '../../components/Button';
import { Spinner } from '../../components/Loading';
import { PageHead } from '../../components/PageHead';

interface IFathomEmbed {
  gridCols: {
    side: number;
    sideSub: number;
  };
  setGridCols: Dispatch<
    SetStateAction<{
      side: number;
      sideSub: number;
    }>
  >;
}

function FathomEmbed(props: IFathomEmbed) {
  const { gridCols, setGridCols } = props;
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (gridCols.sideSub > 0) {
      setGridCols({ ...gridCols, sideSub: 0 });
    }
  }, [gridCols, setGridCols]);

  const [{ data }] = useAxios<{ url: string }>(
    `${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/analytics/dashboard`
  );

  return (
    <div style={{ overflow: 'hidden', height: '100%' }}>
      <PageHead
        title={'Fathom Analytics'}
        description={'thepaladin.news'}
        buttons={
          data?.url ? (
            <>
              <IconButton onClick={() => setCount((count) => count + 1)} icon={<ArrowClockwise16Regular />}>
                Refresh frame
              </IconButton>
              <IconButton
                onClick={() => window.open(data?.url, 'fathom', 'width=1200,height=800')}
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
        src={data?.url}
        style={{ width: '100%', height: 'calc(100% - 64px)', border: 'none', zIndex: 1, position: 'relative' }}
      />
    </div>
  );
}

export { FathomEmbed };
