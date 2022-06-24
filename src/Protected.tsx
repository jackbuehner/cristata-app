import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import loadable from '@loadable/component';
import Color from 'color';
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { IGridCols } from './App';
import './App.css';
import { Appbar } from './components/Appbar';
import { SideNavSubButton } from './components/Button';
import { CristataWebSocket } from './components/CristataWebSocket/CristataWebSocket';
import FluentIcon from './components/FluentIcon';
import { SideNavHeading } from './components/Heading';
import { PageHead } from './components/PageHead';
import { SidenavSub } from './components/SidenavSub';
import { Titlebar } from './components/Titlebar';
import { useNavigationConfig } from './hooks/useNavigationConfig';
import { useAppDispatch } from './redux/hooks';
import { setAppIcon, setAppSearchShown } from './redux/slices/appbarSlice';
import { themeType } from './utils/theme/theme';

/* prettier-ignore */ const HomePage = loadable(() => import(/* webpackChunkName: "HomePage" */'./pages/Home'), { resolveComponent: (c) => c.HomePage });
/* prettier-ignore */ const ProfilePage = loadable(() => import(/* webpackChunkName: "ProfilePage" */'./pages/profile/ProfilePage'), { resolveComponent: (c) => c.ProfilePage });
/* prettier-ignore */ const TeamPage = loadable(() => import(/* webpackChunkName: "TeamPage" */'./pages/teams/TeamPage'), { resolveComponent: (c) => c.TeamPage });
/* prettier-ignore */ const TeamsOverviewPage = loadable(() => import(/* webpackChunkName: "TeamsOverviewPage" */'./pages/teams/TeamsOverviewPage'), { resolveComponent: (c) => c.TeamsOverviewPage });
/* prettier-ignore */ const Playground = loadable(() => import(/* webpackChunkName: "PlaygroundPage" */'./pages/playground'), { resolveComponent: (c) => c.Playground });
/* prettier-ignore */ const PlaygroundNavigation = loadable(() => import(/* webpackChunkName: "PlaygroundNavigation" */'./pages/playground'), { resolveComponent: (c) => c.PlaygroundNavigation });
/* prettier-ignore */ const BillingPaymentsPage = loadable(() => import(/* webpackChunkName: "BillingPaymentsPage" */'./pages/configuration'), { resolveComponent: (c) => c.BillingPaymentsPage });
/* prettier-ignore */ const BillingServiceUsagePage = loadable(() => import(/* webpackChunkName: "BillingServiceUsagePage" */'./pages/configuration'), { resolveComponent: (c) => c.BillingServiceUsagePage });
/* prettier-ignore */ const CollectionSchemaPage = loadable(() => import(/* webpackChunkName: "CollectionSchemaPage" */'./pages/configuration'), { resolveComponent: (c) => c.CollectionSchemaPage });
/* prettier-ignore */ const ConfigurationNavigation = loadable(() => import(/* webpackChunkName: "ConfigurationNavigation" */'./pages/configuration'), { resolveComponent: (c) => c.ConfigurationNavigation });
/* prettier-ignore */ const TokenSecretsPage = loadable(() => import(/* webpackChunkName: "TokenSecretsPage" */'./pages/configuration'), { resolveComponent: (c) => c.TokenSecretsPage });
/* prettier-ignore */ const FathomEmbed = loadable(() => import(/* webpackChunkName: "FathomEmbed" */'./pages/embeds'), { resolveComponent: (c) => c.FathomEmbed });
/* prettier-ignore */ const CollectionItemPage = loadable(() => import(/* webpackChunkName: "CollectionItemPage" */'./pages/CMS/CollectionItemPage'), { resolveComponent: (c) => c.CollectionItemPage });
/* prettier-ignore */ const CollectionPage = loadable(() => import(/* webpackChunkName: "CollectionPage" */'./pages/CMS/CollectionPage'), { resolveComponent: (c) => c.CollectionPage });
/* prettier-ignore */ const PhotoLibraryPage = loadable(() => import(/* webpackChunkName: "PhotoLibraryPage" */'./pages/CMS/PhotoLibraryPage'), { resolveComponent: (c) => c.PhotoLibraryPage });
/* prettier-ignore */ const ProfileNavigation = loadable(() => import(/* webpackChunkName: "ProfileNavigation" */'./pages/profile/ProfileSideNavSub'), { resolveComponent: (c) => c.ProfileSideNavSub });
/* prettier-ignore */ const TeamsNavigation = loadable(() => import(/* webpackChunkName: "TeamsNavigation" */'./pages/teams/TeamsNav'), { resolveComponent: (c) => c.TeamsNav });

HomePage.preload();
ProfilePage.preload();
TeamPage.preload();
TeamsOverviewPage.preload();
Playground.preload();
PlaygroundNavigation.preload();
BillingPaymentsPage.preload();
BillingServiceUsagePage.preload();
CollectionSchemaPage.preload();
ConfigurationNavigation.preload();
TokenSecretsPage.preload();
FathomEmbed.preload();
CollectionItemPage.preload();
CollectionPage.preload();
PhotoLibraryPage.preload();
ProfileNavigation.preload();
TeamsNavigation.preload();

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
        dispatch(setAppIcon(matchedRoute.icon || 'ContentView20Regular'));
      } else if (location.pathname.includes('/cms')) {
        dispatch(setAppIcon('ContentView20Regular'));
      }
    }
  }, [dispatch, location, mainNav]);

  // close search when pathname changes
  useEffect(() => {
    dispatch(setAppSearchShown(false));
  }, [dispatch, location.pathname]);

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
                                  return (
                                    <SideNavSubButton
                                      key={index}
                                      Icon={<FluentIcon key={index} name={item.icon} />}
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
                      element={<ProfileNavigation setIsNavVisibleM={setIsNavVisibleM} />}
                    />
                    <Route
                      path={`/teams/*`}
                      element={<TeamsNavigation setIsNavVisibleM={setIsNavVisibleM} />}
                    />
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
