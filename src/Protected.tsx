import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import loadable from '@loadable/component';
import Color from 'color';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'svelte-preprocess-react/react-router';
import './App.css';
import { PageHead } from './components/PageHead';
import { useAppDispatch } from './redux/hooks';
import { setAppSearchShown } from './redux/slices/appbarSlice';
import type { themeType } from './utils/theme/theme';
/* prettier-ignore */ const FathomEmbed = loadable(() => import(/* webpackChunkName: "FathomEmbed" */'./pages/embeds'), { resolveComponent: (c) => c.FathomEmbed });

FathomEmbed.preload();

interface ProtectedProps {
  setThemeMode: Dispatch<SetStateAction<'light' | 'dark'>>;
}

function Protected(props: ProtectedProps) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const dispatch = useAppDispatch();
  const tenant = location.pathname.split('/')[1];

  // close search when pathname changes
  useEffect(() => {
    dispatch(setAppSearchShown(false));
  }, [dispatch, location.pathname]);

  return (
    <>
      {/** side navigation and main content  */}
      <Content theme={theme}>
        <Routes>
          <Route path={`/${tenant}`}>
            <Route path={`cms`}>
              <Route path={`*`} element={<PageHead title={`CMS`} />} />
            </Route>
            <Route path={`embed/fathom`} element={<FathomEmbed />} />
          </Route>
        </Routes>
      </Content>
    </>
  );
}

const Content = styled.div<{ theme: themeType }>`
  /* skeleton loader */
  .react-skeleton-load.animated::before {
    background-image: ${({ theme }) =>
      `linear-gradient(90deg, ${Color(theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200]).alpha(
        0
      )}, ${Color(theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200]).alpha(0.6)}, ${Color(
        theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200]
      ).alpha(0)})`};
  }
`;

export { Protected };
