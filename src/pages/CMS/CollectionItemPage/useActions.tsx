import { gql, useApolloClient } from '@apollo/client';
import { CollectionPermissions } from '@jackbuehner/cristata-api/dist/api/types/config';
import { get as getProperty } from 'object-path';
import { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import FluentIcon from '../../../components/FluentIcon';
import { Menu } from '../../../components/Menu';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { useDropdown } from '../../../hooks/useDropdown';
import { useAppDispatch } from '../../../redux/hooks';
import { Action } from '../../../redux/slices/appbarSlice';
import { setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { uncapitalize } from '../../../utils/uncapitalize';
import { usePublishModal } from './usePublishModal';
import { useShareModal } from './useShareModal';

interface UseActionsParams {
  y: EntryY;
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
  navigate: NavigateFunction;
  publishStage?: number;
  withPermissions: boolean;
  isEmbedded?: boolean;
  idKey?: string;
  locked?: boolean;
  archived?: boolean;
  hidden?: boolean;
  loadingOrError?: boolean;
}

interface UseActionsReturn {
  actions: Action[];
  quickActions: Action[];
  showActionDropdown: ReturnType<typeof useDropdown>[0];
  Windows: React.ReactNode;
}

function useActions(params: UseActionsParams): UseActionsReturn {
  const client = useApolloClient();
  const data = params.y.data;

  const idKey = params.idKey || '_id';

  const [ShareWindow, showShareModal] = useShareModal(params.y, params.collectionName, params.itemId);
  const [PublishWindow, showPublishModal] = usePublishModal(
    params.y,
    client,
    params.collectionName,
    params.itemId,
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
  const hideItem = useCallback(
    (hide = true) => {
      params.dispatch(setIsLoading(true));

      const HIDE_ITEM = gql`mutation {
      ${uncapitalize(params.collectionName)}Hide(${idKey || '_id'}: "${params.itemId}", hide: ${hide}) {
        hidden
      }
    }`;

      client
        .mutate({ mutation: HIDE_ITEM })
        .then(() => {
          params.dispatch(setIsLoading(false));
          if (hide) {
            if (window.name === '') {
              // redirect to home page if an unnamed window
              toast.success(`Document successfully hidden.`);
              params.navigate('/');
            } else {
              // otherwise, this window was opened by the unnamed window
              // and should be closed once the item is hidden
              window.alert(`Document successfully hidden. This window will close.`);
              window.close();
            }
          } else {
            toast.success(`Document successfully restored.`);
          }
        })
        .catch((err) => {
          params.dispatch(setIsLoading(false));
          console.error(err);
          toast.error(`Failed to document item. \n ${err.message}`);
        });
    },
    [client, idKey, params]
  );

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
    getProperty(data, 'permissions.teams')?.includes('000000000000000000000000') ||
    getProperty(data, 'permissions.users')?.includes('000000000000000000000000');

  // create the actions for this document based on the current user's
  // permissions status and the current doc's status
  const actions = useCallback(() => {
    const actions: (Action | null)[] = [
      {
        label: params.watch.isWatching || params.watch.isMandatoryWatcher ? 'Stop watching' : 'Watch',
        type: 'button',
        icon: params.watch.isWatching || params.watch.isMandatoryWatcher ? 'EyeOff20Regular' : 'Eye24Regular',
        action: () => toggleWatchItem(!params.watch.isWatching),
        disabled:
          params.watch.isMandatoryWatcher ||
          params.actionAccess?.watch !== true ||
          params.loadingOrError ||
          params.archived ||
          params.locked ||
          params.hidden,
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
        disabled:
          params.canPublish !== true ||
          params.loadingOrError ||
          params.archived ||
          params.locked ||
          params.hidden,
        'data-tip':
          params.canPublish !== true
            ? `You cannot publish this document because you do not have permission.`
            : undefined,
      },
      {
        label: params.hidden ? 'Restore from deleted items' : 'Delete',
        type: 'button',
        icon: params.hidden ? 'DeleteOff24Regular' : 'Delete24Regular',
        action: () => hideItem(params.hidden ? false : true),
        color: params.hidden ? 'primary' : 'red',
        disabled:
          params.actionAccess?.hide !== true || params.loadingOrError || params.archived || params.locked,
      },
      {
        label: params.archived ? 'Remove from archive' : 'Archive',
        type: 'button',
        icon: params.archived ? 'FolderArrowUp24Regular' : 'Archive24Regular',
        action: () => archiveItem(params.archived ? false : true),
        color: params.archived ? 'primary' : 'yellow',
        disabled:
          params.actionAccess?.archive !== true || params.loadingOrError || params.locked || params.hidden,
      },
      allHaveAccess
        ? null
        : {
            label: 'Share',
            type: 'button',
            icon: 'Share24Regular',
            action: () => showShareModal(),
            disabled:
              params.actionAccess?.modify !== true ||
              params.loadingOrError ||
              params.archived ||
              params.locked ||
              params.hidden,
            'data-tip':
              params.actionAccess?.modify !== true
                ? `You cannot share this document because you do not have permission to modify it.`
                : undefined,
          },
    ];
    return actions.filter((action): action is Action => !!action);
  }, [allHaveAccess, archiveItem, hideItem, params, showPublishModal, showShareModal, toggleWatchItem])();

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
            .filter((action) => action.label !== 'Publish' && action.label !== 'Share')
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

  // create a list that only includes publish and share actions
  // so that these actions can be used in conjunction with
  // the dropdown
  const quickActions = [
    actions.find((action) => action?.label === 'Share'),
    actions.find((action) => action?.label === 'Publish'),
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
