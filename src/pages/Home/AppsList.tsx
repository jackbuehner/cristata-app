import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import FluentIcon from '../../components/FluentIcon';
import { useNavigationConfig } from '../../hooks/useNavigationConfig';

function AppsList() {
  const navigate = useNavigate();

  const [mainNav] = useNavigationConfig('main', 'cache-only');

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
      {mainNav
        ?.filter((item) => item.to !== '/')
        .map((item) => {
          return (
            <Button
              key={item.label + item.icon + item.to}
              icon={<FluentIcon name={item.icon} />}
              height={80}
              onClick={() => {
                navigate(item.to);
              }}
              cssExtra={css`
                padding: 0;
                width: 80px;
                flex-direction: column;
                gap: 10px;
                > span.IconStyleWrapper {
                  margin: 0;
                  width: 24px;
                  height: 24px;
                  svg {
                    width: 24px;
                    height: 24px;
                  }
                }
              `}
            >
              {item.label}
            </Button>
          );
        })}
    </div>
  );
}

export { AppsList };
