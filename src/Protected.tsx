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
/* prettier-ignore */ const BillingPaymentsPage = loadable(() => import(/* webpackChunkName: "BillingPaymentsPage" */'./pages/configuration'), { resolveComponent: (c) => c.BillingPaymentsPage });
/* prettier-ignore */ const BillingServiceUsagePage = loadable(() => import(/* webpackChunkName: "BillingServiceUsagePage" */'./pages/configuration'), { resolveComponent: (c) => c.BillingServiceUsagePage });
/* prettier-ignore */ const CollectionSchemaPageOld = loadable(() => import(/* webpackChunkName: "CollectionSchemaPage" */'./pages/configuration'), { resolveComponent: (c) => c.CollectionSchemaPageOld });
/* prettier-ignore */ const CollectionSchemaPage = loadable(() => import(/* webpackChunkName: "CollectionSchemaPageVisual" */'./pages/configuration'), { resolveComponent: (c) => c.CollectionSchemaPage });
/* prettier-ignore */ const SystemCollectionConfigPage = loadable(() => import(/* webpackChunkName: "SystemCollectionConfigPage" */'./pages/configuration'), { resolveComponent: (c) => c.SystemCollectionPage });
/* prettier-ignore */ const CMSConfigPage = loadable(() => import(/* webpackChunkName: "SystemCollectionConfigPage" */'./pages/configuration'), { resolveComponent: (c) => c.ContentManagementSystemPage });
/* prettier-ignore */ const TokenSecretsPage = loadable(() => import(/* webpackChunkName: "TokenSecretsPage" */'./pages/configuration'), { resolveComponent: (c) => c.TokenSecretsPage });
/* prettier-ignore */ const FathomEmbed = loadable(() => import(/* webpackChunkName: "FathomEmbed" */'./pages/embeds'), { resolveComponent: (c) => c.FathomEmbed });
/* prettier-ignore */ const WorkflowPage = loadable(() => import(/* webpackChunkName: "CollectionItemPage" */'./pages/CMS/WorkflowPage'), { resolveComponent: (c) => c.WorkflowPage });
/* prettier-ignore */ const CollectionItemPage = loadable(() => import(/* webpackChunkName: "CollectionItemPage" */'./pages/CMS/CollectionItemPage'), { resolveComponent: (c) => c.CollectionItemPage });
/* prettier-ignore */ const CollectionPage = loadable(() => import(/* webpackChunkName: "CollectionPage" */'./pages/CMS/CollectionPage'), { resolveComponent: (c) => c.CollectionPage });
/* prettier-ignore */ const PhotoLibraryPage = loadable(() => import(/* webpackChunkName: "PhotoLibraryPage" */'./pages/CMS/PhotoLibraryPage'), { resolveComponent: (c) => c.PhotoLibraryPage });

BillingPaymentsPage.preload();
BillingServiceUsagePage.preload();
CollectionSchemaPage.preload();
CollectionSchemaPageOld.preload();
TokenSecretsPage.preload();
FathomEmbed.preload();
WorkflowPage.preload();
CollectionItemPage.preload();
CollectionPage.preload();
PhotoLibraryPage.preload();

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
              <Route path={`workflow`} element={<WorkflowPage />} />
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
            <Route path={`embed/fathom`} element={<FathomEmbed />} />
            <Route path={`configuration`}>
              <Route path={`billing`}>
                <Route path={`usage`} element={<BillingServiceUsagePage />} />
                <Route path={`payments`} element={<BillingPaymentsPage />} />
              </Route>
              <Route path={`security`}>
                <Route path={`tokens-secrets`} element={<TokenSecretsPage />} />
              </Route>
              <Route path={`app`}>
                <Route path={`cms`} element={<CMSConfigPage />} />
              </Route>
              <Route path={`schema/:collection`} element={<CollectionSchemaPage />} />
              <Route path={`schema/:collection/code`} element={<CollectionSchemaPageOld />} />
              <Route
                path={`system-collection/:collection/action-access`}
                element={<SystemCollectionConfigPage />}
              />
            </Route>
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
