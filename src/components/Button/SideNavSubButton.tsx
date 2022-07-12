/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled/macro';
import { css, useTheme } from '@emotion/react';
import Color from 'color';
import { Dispatch, ReactText, SetStateAction } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '.';
import { colorType, themeType } from '../../utils/theme/theme';

function SideNavSubButton(props: {
  children: ReactText;
  Icon: React.ReactElement;
  to?: string;
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme() as themeType;

  const isSameLocation = props.to && location.pathname === props.to.split('?')[0];
  const isSameSearch =
    (props.to &&
      `${new URLSearchParams(location.search)}` === `${new URLSearchParams(`?${props.to.split('?')[1]}`)}`) ||
    (props.to && location.search === `` && props.to.split('?')[1] === undefined);

  const isScoped = `${props.children}`.split('::').length === 2;

  return (
    <Button
      height={`36px`}
      width={`calc(100% - 24px)`}
      cssExtra={css`
        flex-direction: row;
        font-weight: 500;
        color: ${isSameLocation && isSameSearch ? theme.color.primary[theme.mode === 'light' ? 900 : 300] : ''};
        margin: 0 12px 2px 12px;
        justify-content: flex-start;
        background: ${isSameLocation && isSameSearch
          ? Color(theme.color.neutral[theme.mode][800]).alpha(0.12).string()
          : 'unset'};
        > span:nth-of-type(2) {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
      `}
      colorShade={theme.mode === 'light' ? 600 : 300}
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
                ? theme.color.primary[theme.mode === 'light' ? 900 : 300]
                : theme.color.neutral[theme.mode][1400]};
            }
          `}
        >
          {props.Icon}
        </span>
      }
    >
      <ButtonChild>
        {isScoped ? (
          <>
            <div>{`${props.children}`.split('::')[1]}</div>
            <Scope color={'neutral'}>{`${props.children}`.split('::')[0]}</Scope>
          </>
        ) : (
          props.children
        )}
      </ButtonChild>
    </Button>
  );
}

const ButtonChild = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
`;

const Scope = styled.div<{ color: colorType }>`
  padding: 3px 5px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: ${({ theme, color }) =>
      color === 'neutral'
        ? Color(theme.color[color][theme.mode][1200]).alpha(0.25).string()
        : Color(theme.color[color][theme.mode === 'light' ? 800 : 300])
            .alpha(0.1)
            .string()}
    0px 0px 0px 1.25px inset !important;
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme, color }) =>
    color === 'neutral'
      ? Color(theme.color[color][theme.mode][1200]).string()
      : Color(theme.color[color][theme.mode === 'light' ? 800 : 300]).string()};
`;

export { SideNavSubButton };
