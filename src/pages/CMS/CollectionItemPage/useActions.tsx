import { ApolloQueryResult, gql, OperationVariables, useApolloClient } from '@apollo/client';
import { CollectionPermissions } from '@jackbuehner/cristata-api/dist/api/types/config';
import { get as getProperty } from 'object-path';
import { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import FluentIcon from '../../../components/FluentIcon';
import { Menu } from '../../../components/Menu';
import { useDropdown } from '../../../hooks/useDropdown';
import { useAppDispatch } from '../../../redux/hooks';
import { Action } from '../../../redux/slices/appbarSlice';
import { CmsItemState, setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { uncapitalize } from '../../../utils/uncapitalize';
import { saveChanges } from './saveChanges';
import { usePublishModal } from './usePublishModal';
import { useShareModal } from './useShareModal';

interface UseActionsParams {
  actionAccess: Record<keyof CollectionPermissions, boolean | undefined> | undefined;
  canPublish: boolean;
  watch: {
    isMandatoryWatcher: boolean;
    isWatching: boolean;
    mandatoryWatchersList: string;
  };
  collectionName: string;
  itemId: string;
  dispatch: ReturnType<typeof useAppDispatch>;
  state: CmsItemState;
  refetchData: (variables?: Partial<OperationVariables> | undefined) => Promise<ApolloQueryResult<any>>;
  navigate: NavigateFunction;
  publishStage?: number;
  withPermissions: boolean;
  isEmbedded?: boolean;
  idKey?: string;
}

interface UseActionsReturn {
  actions: Action[];
  quickActions: Action[];
  showActionDropdown: ReturnType<typeof useDropdown>[0];
  Windows: React.ReactNode;
}

function useActions(params: UseActionsParams): UseActionsReturn {
  const client = useApolloClient();

  const idKey = params.idKey || '_id';

  const [ShareWindow, showShareModal] = useShareModal(params.collectionName, params.itemId);
  const [PublishWindow, showPublishModal] = usePublishModal(
    client,
    params.collectionName,
    params.itemId,
    params.refetchData,
    params.publishStage,
    idKey
  );

  /**
   * Set the item to be hidden.
   *
   * This is used to hide the doc from the list of viewable docs in the
   * collection without completely deleting it. This is useful as a
   * "soft" deletion that can be undone because the data is not actually
   * deleted.
   */
  const hideItem = useCallback(() => {
    params.dispatch(setIsLoading(true));

    const HIDE_ITEM = gql`mutation {
      ${uncapitalize(params.collectionName)}Hide(${idKey || '_id'}: "${params.itemId}") {
        hidden
      }
    }`;

    client
      .mutate({ mutation: HIDE_ITEM })
      .then(() => {
        params.dispatch(setIsLoading(false));
        if (window.name === '') {
          // redirect to home page if an unnamed window
          toast.success(`Item successfully hidden.`);
          params.navigate('/');
        } else {
          // otherwise, this window was opened by the unnamed window
          // and should be closed once the item is hidden
          window.alert(`Item successfully hidden. This window will close.`);
          window.close();
        }
      })
      .catch((err) => {
        params.dispatch(setIsLoading(false));
        console.error(err);
        toast.error(`Failed to hide item. \n ${err.message}`);
      });
  }, [client, idKey, params]);

  /**
   * Set whether the item is archived.
   */
  const archiveItem = useCallback(
    (archive = true) => {
      params.dispatch(setIsLoading(true));

      const ARCHIVE_ITEM = gql`mutation {
      ${uncapitalize(params.collectionName)}Archive(${idKey || '_id'}: "${
        params.itemId
      }", archive: ${archive}) {
        archived
      }
    }`;

      client
        .mutate({ mutation: ARCHIVE_ITEM })
        .finally(() => {
          params.dispatch(setIsLoading(false));
        })
        .then(({ data }) => {
          params.refetchData();
          if (data[`${uncapitalize(params.collectionName)}Archive`].archived)
            toast.success(`Item successfully archived.`);
          else toast.success(`Item successfully removed from the archive.`);
        })
        .catch((err) => {
          console.error(err);
          toast.error(`Failed to archived item. \n ${err.message}`);
        });
    },
    [client, idKey, params]
  );

  /**
   * Toggle whether the current user is watching this document.
   *
   * This adds or removes the current user from the list of people
   * who receive notification when this document changes.
   */
  const toggleWatchItem = useCallback(
    (mode: boolean) => {
      params.dispatch(setIsLoading(true));

      const WATCH_ITEM = gql`mutation {
      ${uncapitalize(params.collectionName)}Watch(${idKey || '_id'}: "${params.itemId}") {
        people {
          watching {
            _id
          }
        }
      }
    }`;
      const UNWATCH_ITEM = gql`mutation {
      ${uncapitalize(params.collectionName)}Watch(${idKey || '_id'}: "${params.itemId}", watch: false) {
        people {
          watching {
            _id
          }
        }
      }
    }`;

      client
        .mutate({ mutation: mode === true ? WATCH_ITEM : UNWATCH_ITEM })
        .finally(() => {
          params.dispatch(setIsLoading(false));
        })
        .then(() => {
          if (mode === true) {
            toast.success(`You are now watching this item.`);
          } else {
            toast.success(`You are no longer watching this item.`);
          }
          params.refetchData();
        })
        .catch((err) => {
          console.error(err);
          toast.error(`Failed to watch item. \n ${err.message}`);
        });
    },
    [client, idKey, params]
  );

  const allHaveAccess =
    params.withPermissions === false ||
    getProperty(params.state.fields, 'permissions.teams')?.includes('000000000000000000000000') ||
    getProperty(params.state.fields, 'permissions.users')?.includes('000000000000000000000000');

  // create the actions for this document based on the current user's
  // permissions status and the current doc's status
  const actions = useCallback(() => {
    const actions: (Action | null)[] = [
      {
        label: 'Discard changes & refresh',
        type: 'icon',
        icon: 'ArrowClockwise24Regular',
        action: () => params.refetchData(),
      },
      {
        label: params.watch.isWatching || params.watch.isMandatoryWatcher ? 'Stop watching' : 'Watch',
        type: 'button',
        icon: params.watch.isWatching || params.watch.isMandatoryWatcher ? 'EyeOff20Regular' : 'Eye24Regular',
        action: () => toggleWatchItem(!params.watch.isWatching),
        disabled: params.watch.isMandatoryWatcher || params.actionAccess?.watch !== true,
        'data-tip': params.watch.isMandatoryWatcher
          ? `You cannot stop watching this document because you are in one of the following groups: ${params.watch.mandatoryWatchersList}`
          : undefined,
      },
      {
        label: 'Publish',
        type: 'button',
        icon: 'CloudArrowUp24Regular',
        action: () => showPublishModal(),
        color: 'success',
        disabled: params.canPublish !== true,
        'data-tip':
          params.canPublish !== true
            ? `You cannot publish this document because you do not have permission.`
            : undefined,
      },
      {
        label: 'Delete',
        type: 'button',
        icon: 'Delete24Regular',
        action: () => hideItem(),
        color: 'red',
        disabled: params.actionAccess?.hide !== true,
      },
      {
        label: params.state.fields.archived ? 'Remove from archive' : 'Archive',
        type: 'button',
        icon: params.state.fields.archived ? 'FolderArrowUp24Regular' : 'Archive24Regular',
        action: () => archiveItem(params.state.fields.archived ? false : true),
        color: params.state.fields.archived ? 'primary' : 'yellow',
        disabled: params.actionAccess?.archive !== true,
      },
      {
        label: 'Save',
        type: 'button',
        icon: 'Save24Regular',
        action: () =>
          saveChanges(
            client,
            params.collectionName,
            params.itemId,
            {
              dispatch: params.dispatch,
              refetch: params.refetchData,
              state: params.state,
            },
            undefined,
            undefined,
            params.idKey
          ),
        disabled: !params.state.isUnsaved || params.actionAccess?.modify !== true,
        'data-tip':
          params.actionAccess?.modify !== true
            ? `You cannot save this document because you do not have permission.`
            : !params.state.isUnsaved
            ? `There are no changes to save.`
            : undefined,
      },
      allHaveAccess
        ? null
        : {
            label: 'Share',
            type: 'button',
            icon: 'Share24Regular',
            action: () => showShareModal(),
            disabled: params.actionAccess?.modify !== true,
            'data-tip':
              params.actionAccess?.modify !== true
                ? `You cannot share this document because you do not have permission to modify it.`
                : undefined,
          },
    ];
    return actions.filter((action): action is Action => !!action);
  }, [
    allHaveAccess,
    archiveItem,
    client,
    hideItem,
    params,
    showPublishModal,
    showShareModal,
    toggleWatchItem,
  ])();

  // create a dropdown with all actions except save and publish
  const [showActionDropdown] = useDropdown((triggerRect, dropdownRef) => {
    return (
      <Menu
        ref={dropdownRef}
        pos={{
          top: triggerRect.top + triggerRect.height,
          left: triggerRect.right - 240,
          width: 240,
        }}
        items={
          actions
            .filter((action) => action.label !== 'Save' && action.label !== 'Share')
            .map((action) => {
              return {
                onClick: (e) => action.action(e),
                label: action.label,
                color: action?.color || 'primary',
                disabled: action.disabled,
                icon: action.icon ? <FluentIcon name={action.icon} /> : <></>,
                'data-tip': action['data-tip'],
              };
            }) || []
        }
      />
    );
  });

  // create a list that only includes save and share actions
  // so that these actions can be used in conjunction with
  // the dropdown
  const quickActions = [
    actions.find((action) => action?.label === 'Save'),
    actions.find((action) => action?.label === 'Share'),
  ].filter((action): action is Action => !!action);

  return {
    actions,
    quickActions,
    showActionDropdown,
    Windows: (
      <>
        {ShareWindow}
        {PublishWindow}
      </>
    ),
  };
}

export { useActions };
export type { Action };
