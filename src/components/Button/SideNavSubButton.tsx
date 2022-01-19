/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import Color from 'color';
import { Dispatch, ReactText, SetStateAction } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '.';
import { themeType } from '../../utils/theme/theme';

function SideNavSubButton(props: {
  children: ReactText;
  Icon: JSX.Element;
  to?: string;
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme() as themeType;

  const isSameLocation = props.to && location.pathname.indexOf(props.to.split('?')[0]) !== -1;
  const isSameSearch =
    (props.to && location.search === `?${props.to.split('?')[1]}`) ||
    (props.to && location.search === `` && props.to.split('?')[1] === undefined);

  return (
    <Button
      height={`36px`}
      width={`calc(100% - 12px)`}
      cssExtra={css`
        flex-direction: row;
        font-weight: 500;
        color: ${isSameLocation && isSameSearch ? theme.color.primary[900] : ''};
        margin: 0 6px 2px 6px;
        justify-content: flex-start;
        background: ${isSameLocation && isSameSearch
          ? Color(theme.color.neutral[theme.mode][800]).alpha(0.12).string()
          : 'unset'};
        > span:nth-of-type(2) {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}
      colorShade={600}
      backgroundColor={{ base: 'white' }}
      border={{ base: '1px solid transparent' }}
      onClick={() => {
        if (props.to) navigate(props.to);
        if (props.setIsNavVisibleM) props.setIsNavVisibleM(false);
      }}
      customIcon={
        <span
          css={css`
            width: 24px;
            height: 24px;
            margin-right: 6px;
            svg {
              width: 24px;
              height: 24px;
              fill: ${isSameLocation && isSameSearch
                ? theme.color.primary[900]
                : theme.color.neutral[theme.mode][1400]};
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
