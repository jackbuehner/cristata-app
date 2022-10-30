import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import loadable from '@loadable/component';
import Color from 'color';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { Appbar } from './components/Appbar';
import { PageHead } from './components/PageHead';
import { SideNavigation } from './components/SideNavigation';
import { Titlebar } from './components/Titlebar';
import { useAppDispatch } from './redux/hooks';
import { setAppSearchShown } from './redux/slices/appbarSlice';
import { themeType } from './utils/theme/theme';

/* prettier-ignore */ const HomePage = loadable(() => import(/* webpackChunkName: "HomePage" */'./pages/Home'), { resolveComponent: (c) => c.HomePage });
/* prettier-ignore */ const ProfilePage = loadable(() => import(/* webpackChunkName: "ProfilePage" */'./pages/profile/ProfilePage'), { resolveComponent: (c) => c.ProfilePage });
/* prettier-ignore */ const TeamPage = loadable(() => import(/* webpackChunkName: "TeamPage" */'./pages/teams/TeamPage'), { resolveComponent: (c) => c.TeamPage });
/* prettier-ignore */ const TeamsOverviewPage = loadable(() => import(/* webpackChunkName: "TeamsOverviewPage" */'./pages/teams/TeamsOverviewPage'), { resolveComponent: (c) => c.TeamsOverviewPage });
/* prettier-ignore */ const Playground = loadable(() => import(/* webpackChunkName: "PlaygroundPage" */'./pages/playground'), { resolveComponent: (c) => c.Playground });
/* prettier-ignore */ const PlaygroundNavigation = loadable(() => import(/* webpackChunkName: "PlaygroundNavigation" */'./pages/playground'), { resolveComponent: (c) => c.PlaygroundNavigation });
/* prettier-ignore */ const BillingPaymentsPage = loadable(() => import(/* webpackChunkName: "BillingPaymentsPage" */'./pages/configuration'), { resolveComponent: (c) => c.BillingPaymentsPage });
/* prettier-ignore */ const BillingServiceUsagePage = loadable(() => import(/* webpackChunkName: "BillingServiceUsagePage" */'./pages/configuration'), { resolveComponent: (c) => c.BillingServiceUsagePage });
/* prettier-ignore */ const CollectionSchemaPageOld = loadable(() => import(/* webpackChunkName: "CollectionSchemaPage" */'./pages/configuration'), { resolveComponent: (c) => c.CollectionSchemaPageOld });
/* prettier-ignore */ const CollectionSchemaPage = loadable(() => import(/* webpackChunkName: "CollectionSchemaPageVisual" */'./pages/configuration'), { resolveComponent: (c) => c.CollectionSchemaPage });
/* prettier-ignore */ const ConfigurationNavigation = loadable(() => import(/* webpackChunkName: "ConfigurationNavigation" */'./pages/configuration'), { resolveComponent: (c) => c.ConfigurationNavigation });
/* prettier-ignore */ const TokenSecretsPage = loadable(() => import(/* webpackChunkName: "TokenSecretsPage" */'./pages/configuration'), { resolveComponent: (c) => c.TokenSecretsPage });
/* prettier-ignore */ const FathomEmbed = loadable(() => import(/* webpackChunkName: "FathomEmbed" */'./pages/embeds'), { resolveComponent: (c) => c.FathomEmbed });
/* prettier-ignore */ const CollectionItemPage = loadable(() => import(/* webpackChunkName: "CollectionItemPage" */'./pages/CMS/CollectionItemPage'), { resolveComponent: (c) => c.CollectionItemPage });
/* prettier-ignore */ const CollectionPage = loadable(() => import(/* webpackChunkName: "CollectionPage" */'./pages/CMS/CollectionPage'), { resolveComponent: (c) => c.CollectionPage });
/* prettier-ignore */ const PhotoLibraryPage = loadable(() => import(/* webpackChunkName: "PhotoLibraryPage" */'./pages/CMS/PhotoLibraryPage'), { resolveComponent: (c) => c.PhotoLibraryPage });
/* prettier-ignore */ const ProfileNavigation = loadable(() => import(/* webpackChunkName: "ProfileNavigation" */'./pages/profile/ProfileSideNavSub'), { resolveComponent: (c) => c.ProfileSideNavSub });
/* prettier-ignore */ const TeamsNavigation = loadable(() => import(/* webpackChunkName: "TeamsNavigation" */'./pages/teams/TeamsNav'), { resolveComponent: (c) => c.TeamsNav });
/* prettier-ignore */ const CmsNavigation = loadable(() => import(/* webpackChunkName: "TeamsNavigation" */'./pages/CMS/CmsNavigation'), { resolveComponent: (c) => c.CmsNavigation });

HomePage.preload();
ProfilePage.preload();
TeamPage.preload();
TeamsOverviewPage.preload();
Playground.preload();
PlaygroundNavigation.preload();
BillingPaymentsPage.preload();
BillingServiceUsagePage.preload();
CollectionSchemaPage.preload();
CollectionSchemaPageOld.preload();
ConfigurationNavigation.preload();
TokenSecretsPage.preload();
FathomEmbed.preload();
CollectionItemPage.preload();
CollectionPage.preload();
PhotoLibraryPage.preload();
ProfileNavigation.preload();
TeamsNavigation.preload();
CmsNavigation.preload();

interface ProtectedProps {
  setThemeMode: Dispatch<SetStateAction<'light' | 'dark'>>;
}

function Protected(props: ProtectedProps) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const dispatch = useAppDispatch();

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  // close search when pathname changes
  useEffect(() => {
    dispatch(setAppSearchShown(false));
  }, [dispatch, location.pathname]);

  const isOffline = navigator.onLine === false;

  return (
    <>
      {isCustomTitlebarVisible ? <Titlebar /> : null}
      <PageWrapper isCustomTitlebarVisible={isCustomTitlebarVisible}>
        {/** app bar */}
        <Appbar />

        {/** offline notice */}
        {isOffline ? <OfflineNotice theme={theme}>Working offline</OfflineNotice> : null}

        {/** side navigation and main content  */}
        <Wrapper theme={theme}>
          {window.name === '' ? (
            <SideNavigation>
              {(setIsNavVisible) => (
                <Routes>
                  <Route path={`/cms/*`} element={<CmsNavigation setIsNavVisibleM={setIsNavVisible} />} />
                  <Route
                    path={`/profile/*`}
                    element={<ProfileNavigation setIsNavVisibleM={setIsNavVisible} />}
                  />
                  <Route path={`/teams/*`} element={<TeamsNavigation setIsNavVisibleM={setIsNavVisible} />} />
                  <Route path={`/playground`} element={<PlaygroundNavigation />} />
                  <Route path={`/configuration/*`} element={<ConfigurationNavigation />} />
                  <Route path={`*`} element={<></>} />
                </Routes>
              )}
            </SideNavigation>
          ) : null}
          <Content theme={theme}>
            <Routes>
              <Route path={`/cms`}>
                <Route path={`collection/:collection`}>
                  <Route index element={<CollectionPage />} />
                  <Route path={`:item_id`} element={<CollectionItemPage />} />
                  <Route path={`:item_id/version/:version_date`} element={<CollectionItemPage />} />
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
                <Route path={`schema/:collection/code`} element={<CollectionSchemaPageOld />} />
              </Route>
              <Route path={`/`} element={<HomePage />} />
            </Routes>
          </Content>
        </Wrapper>
      </PageWrapper>
    </>
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
  height: 0;
  flex-grow: 1;
  flex-shrink: 1;
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

const OfflineNotice = styled.div<{ theme: themeType }>`
  display: flex;
  height: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.neutral.dark[100]};
  background-color: ${({ theme }) => theme.color.orange[800]};
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-weight: 600;
  line-height: 13px;
  letter-spacing: 0.3px;
  flex-grow: 0;
  flex-shrink: 0;
`;

export { Protected };
