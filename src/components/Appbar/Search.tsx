import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { setAppSearchShown } from '../../redux/slices/appbarSlice';
import { colorType, themeType } from '../../utils/theme/theme';
import { IconButton } from '../Button';
import { FluentIcon } from '../FluentIcon';

interface SearchProps {
  name: string;
  color: colorType;
}

function Search(props: SearchProps) {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const tenant = location.pathname.split('/')[1];

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  const [value, setValue] = useState('');
  useEffect(() => {
    if (searchParams.has('_search')) {
      setValue(searchParams.get('_search') as string);
    } else {
      setValue('');
    }
  }, [searchParams, pathname]);

  const executeSearch = () => {
    if (value.length > 0) searchParams.set('_search', value);
    else searchParams.delete('_search');
    navigate(`/${tenant}${pathname}?${searchParams.toString()}`);
  };

  return (
    <div style={{ position: 'relative' }}>
      <TextInputComponent
        theme={theme}
        type={`text`}
        color={props.color}
        placeholder={`Search ${props.name}`}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') executeSearch();
        }}
        isCustomTitlebarVisible={isCustomTitlebarVisible}
      ></TextInputComponent>
      <IconButton
        icon={<FluentIcon name={'PanelRightContract20Regular'} />}
        onClick={() => {
          dispatch(setAppSearchShown(false));
        }}
        color={props.color}
        data-tip={`Collapse search bar`}
        data-delay-show={0}
        data-effect={'solid'}
        data-place={'bottom'}
        data-offset={`{ 'bottom': 4 }`}
        forcedThemeMode={isCustomTitlebarVisible ? 'dark' : undefined}
        cssExtra={css`
          -webkit-app-region: no-drag;
          app-region: no-drag;
          position: absolute;
          top: 9px;
          right: 36px;
        `}
      />
      <IconButton
        icon={<FluentIcon name={'ArrowRight20Regular'} />}
        onClick={executeSearch}
        color={props.color}
        data-tip={`Search`}
        data-delay-show={0}
        data-effect={'solid'}
        data-place={'bottom'}
        data-offset={`{ 'bottom': 4 }`}
        forcedThemeMode={isCustomTitlebarVisible ? 'dark' : undefined}
        cssExtra={css`
          -webkit-app-region: no-drag;
          app-region: no-drag;
          position: absolute;
          top: 9px;
          right: 3px;
        `}
      />
    </div>
  );
}

const TextInputComponent = styled.input<{
  theme: themeType;
  color: colorType;
  isCustomTitlebarVisible: boolean;
}>`
  resize: none;
  padding: 10px 8px;
  margin: 6px 0 6px 0;
  line-height: 16px;
  background-color: transparent;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  width: 400px;
  @media (max-width: 1120px) {
    width: 300px;
  }
  @media (max-width: 1000px) {
    width: 200px;
  }
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  appearance: none; /* override native appearance (safari fix) */
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus {
    outline: none;
    box-shadow: ${({ theme, color }) => {
        if (color === 'neutral') color = 'primary';
        return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
      }}
      0px 0px 0px 2px inset;
  }
  -webkit-app-region: no-drag;
  app-region: no-drag;
`;

export { Search };
