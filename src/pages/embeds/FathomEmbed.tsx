import { Open24Regular } from '@fluentui/react-icons';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { IconButton } from '../../components/Button';
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
  useEffect(() => {
    props.setGridCols({ ...props.gridCols, sideSub: 0 });
  });

  return (
    <div style={{ overflow: 'hidden', height: '100%' }}>
      <PageHead
        title={'Fathom Analytics'}
        description={'thepaladin.news'}
        buttons={
          <>
            <IconButton
              onClick={() => window.open('https://app.usefathom.com/share/uiipkyhl/thepaladin.news')}
              icon={<Open24Regular />}
            >
              Open Externally
            </IconButton>
          </>
        }
      />
      <iframe
        title={'fathom'}
        src={'https://app.usefathom.com/share/uiipkyhl/thepaladin.news'}
        style={{ width: '100%', height: 'calc(100% - 64px)', border: 'none' }}
      />
    </div>
  );
}

export { FathomEmbed };
