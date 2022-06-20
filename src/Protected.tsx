import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import * as fluentIcons from '@fluentui/react-icons';
import { ContentView20Regular } from '@fluentui/react-icons';
import Color from 'color';
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { IGridCols } from './App';
import './App.css';
import { Appbar } from './components/Appbar';
import { SideNavSubButton } from './components/Button';
import { CristataWebSocket } from './components/CristataWebSocket/CristataWebSocket';
import { SideNavHeading } from './components/Heading';
import { PageHead } from './components/PageHead';
import { SidenavSub } from './components/SidenavSub';
import { Titlebar } from './components/Titlebar';
import { useNavigationConfig } from './hooks/useNavigationConfig';
import { CollectionItemPage } from './pages/CMS/CollectionItemPage';
import { CollectionPage } from './pages/CMS/CollectionPage';
import { PhotoLibraryPage } from './pages/CMS/PhotoLibraryPage';
import {
  BillingPaymentsPage,
  BillingServiceUsagePage,
  CollectionSchemaPage,
  ConfigurationNavigation,
  TokenSecretsPage,
} from './pages/configuration';
import { FathomEmbed } from './pages/embeds';
import { HomePage } from './pages/Home';
import { Playground, PlaygroundNavigation } from './pages/playground';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ProfileSideNavSub } from './pages/profile/ProfileSideNavSub';
import { TeamPage } from './pages/teams/TeamPage';
import { TeamsNav } from './pages/teams/TeamsNav';
import { TeamsOverviewPage } from './pages/teams/TeamsOverviewPage';
import { useAppDispatch } from './redux/hooks';
import { setAppIcon, setAppSearchShown } from './redux/slices/appbarSlice';
import { isFluentIconComponent } from './utils/isFluentIconComponent';
import { themeType } from './utils/theme/theme';

interface ProtectedProps {
  setThemeMode: Dispatch<SetStateAction<'light' | 'dark'>>;
}

function Protected(props: ProtectedProps) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [gridCols] = useState({ side: 79, sideSub: 300 });

  // store whether the nav is shown
  const [isNavVisibleM, setIsNavVisibleM] = useState(false);

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  // get the navigation for the cms
  const [cmsNav] = useNavigationConfig('cms');

  //update app bar based on routes
  const [mainNav] = useNavigationConfig('main');
  useEffect(() => {
    if (mainNav) {
      const matchedRoute = mainNav.find((item) => location.pathname === item.to);

      if (matchedRoute) {
        const Icon = fluentIcons[matchedRoute.icon];
        dispatch(setAppIcon(isFluentIconComponent(Icon) ? Icon : ContentView20Regular));
      } else if (location.pathname.includes('/cms')) {
        dispatch(setAppIcon(ContentView20Regular));
      }

      // close search on navigate
      dispatch(setAppSearchShown(false));
    }
  }, [dispatch, location, mainNav]);

  return (
    <CristataWebSocket>
      {isCustomTitlebarVisible ? <Titlebar /> : null}
      <PageWrapper isCustomTitlebarVisible={isCustomTitlebarVisible}>
        {/** app bar */}
        <Appbar />

        {/** side navigation and main content  */}
        <Wrapper theme={theme}>
          {window.name === '' ? (
            <SideNavWrapper gridCols={gridCols} isNavVisibleM={isNavVisibleM}>
              <SideNavs>
                <SidenavSub gridCols={gridCols} isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}>
                  <Routes>
                    <Route
                      path={`/cms/*`}
                      element={
                        <>
                          {cmsNav?.map((group, index) => {
                            return (
                              <Fragment key={index}>
                                <SideNavHeading className={'not-header'}>{group.label}</SideNavHeading>
                                {group.items.map((item, index) => {
                                  const Icon = fluentIcons[item.icon];
                                  return (
                                    <SideNavSubButton
                                      key={index}
                                      Icon={isFluentIconComponent(Icon) ? <Icon /> : <span />}
                                      to={item.to}
                                      setIsNavVisibleM={setIsNavVisibleM}
                                    >
                                      {item.label}
                                    </SideNavSubButton>
                                  );
                                })}
                              </Fragment>
                            );
                          })}
                        </>
                      }
                    />
                    <Route
                      path={`/profile/*`}
                      element={<ProfileSideNavSub setIsNavVisibleM={setIsNavVisibleM} />}
                    />
                    <Route path={`/teams/*`} element={<TeamsNav setIsNavVisibleM={setIsNavVisibleM} />} />
                    <Route path={`/playground`} element={<PlaygroundNavigation />} />
                    <Route path={`/configuration/*`} element={<ConfigurationNavigation />} />
                    <Route path={`*`} element={<></>} />
                  </Routes>
                </SidenavSub>
              </SideNavs>
            </SideNavWrapper>
          ) : null}
          <Content theme={theme}>
            <Routes>
              <Route path={`/cms`}>
                <Route path={`collection/:collection`}>
                  <Route index element={<CollectionPage />} />
                  <Route path={`:item_id`} element={<CollectionItemPage />} />
                </Route>
                <Route path={`photos/library`}>
                  <Route index element={<PhotoLibraryPage />} />
                  <Route path={`:photo_id`} element={<PhotoLibraryPage />} />
                </Route>
                <Route path={`*`} element={<PageHead title={`CMS`} />} />
              </Route>
              <Route path={`/profile`}>
                <Route index element={<PageHead title={`Profiles`} />} />
                <Route path={`:profile_id`} element={<ProfilePage />} />
              </Route>
              <Route path={`/teams`}>
                <Route index element={<TeamsOverviewPage />} />
                <Route path={`:team_id`} element={<TeamPage />} />
              </Route>
              <Route path={`/playground`} element={<Playground setThemeMode={props.setThemeMode} />} />
              <Route path={`/embed/fathom`} element={<FathomEmbed />} />
              <Route path={`/configuration`}>
                <Route path={`billing`}>
                  <Route path={`usage`} element={<BillingServiceUsagePage />} />
                  <Route path={`payments`} element={<BillingPaymentsPage />} />
                </Route>
                <Route path={`security`}>
                  <Route path={`tokens-secrets`} element={<TokenSecretsPage />} />
                </Route>
                <Route path={`schema/:collection`} element={<CollectionSchemaPage />} />
              </Route>
              <Route path={`/`} element={<HomePage />} />
            </Routes>
          </Content>
        </Wrapper>
      </PageWrapper>
    </CristataWebSocket>
  );
}

const PageWrapper = styled.div<{ isCustomTitlebarVisible?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${({ isCustomTitlebarVisible }) =>
    isCustomTitlebarVisible ? 'calc(100% - env(titlebar-area-height, 33px))' : '100%'};
  position: fixed;

  @media print {
    height: 100%;
  }
`;

const Wrapper = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  @media (max-width: 600px) {
    display: block;
  }
  width: 100%;
  height: calc(100% - ${({ theme }) => theme.dimensions.appbar.height});
`;

const SideNavWrapper = styled.div<{
  gridCols: IGridCols;
  isNavVisibleM: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: fit-content;
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  height: 100%;
  //box-shadow: rgb(0 0 0 / 5%) 1px 0px 2px 0px, rgb(0 0 0 / 5%) 4px 0px 8px -2px;
  z-index: 999;
  @media (max-width: 600px) {
    width: 100%;
    height: ${({ isNavVisibleM }) => (isNavVisibleM ? '100%' : 'fit-content')};
    position: ${({ isNavVisibleM }) => (isNavVisibleM ? 'initial' : 'fixed')};
    bottom: ${({ isNavVisibleM }) => (isNavVisibleM ? 'unset' : 0)};
  }
`;

const SideNavs = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: 600px) {
    flex-direction: column-reverse;
  }
  height: calc(100%);
`;

const Content = styled.div<{ theme: themeType }>`
  overflow: auto;
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100])};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  width: 100%;
  height: 100%;

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
