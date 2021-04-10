/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactText } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '.';

function SideNavSubButton(props: { children: ReactText; Icon: JSX.Element; to?: string }) {
  const history = useHistory();

  return (
    <Button
      height={`36px`}
      width={`calc(100% - 12px)`}
      cssExtra={css`
        flex-direction: row;
        font-weight: bold;
        margin: 0 6px 2px 6px;
        justify-content: flex-start;
      `}
      backgroundColor={{ base: 'white' }}
      border={{ base: '1px solid transparent' }}
      onClick={() => (props.to ? history.push(props.to) : null)}
      customIcon={
        <span
          css={css`
            width: 24px;
            height: 24px;
            margin-right: 6px;
            svg {
              width: 24px;
              height: 24px;
            }
          `}
        >
          {props.Icon}
        </span>
      }
    >
      {props.children}
    </Button>
  );
}

export { SideNavSubButton };
