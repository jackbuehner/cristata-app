import { ApolloQueryResult, gql, OperationVariables } from '@apollo/client';
import {
  ArrowClockwise24Regular,
  CloudArrowUp24Regular,
  Delete24Regular,
  EyeHide24Regular,
  EyeShow24Regular,
  Save24Regular,
} from '@fluentui/react-icons';
import { CollectionPermissions } from '@jackbuehner/cristata-api/dist/types/config';
import { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Menu } from '../../../components/Menu';
import { client } from '../../../graphql/client';
import { useDropdown } from '../../../hooks/useDropdown';
import { useAppDispatch } from '../../../redux/hooks';
import { CmsItemState, setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { uncapitalize } from '../../../utils/uncapitalize';
import { Iaction } from '../ItemDetailsPage/ItemDetailsPage';
import { saveChanges } from './saveChanges';

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
}

interface UseActionsReturn {
  actions: Iaction[];
  quickActions: Iaction[];
  showActionDropdown: ReturnType<typeof useDropdown>[0];
}

function useActions(params: UseActionsParams): UseActionsReturn {
  const idKey = '_id';

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
        toast.success(`Item successfully hidden.`);
        params.navigate('/');
      })
      .catch((err) => {
        params.dispatch(setIsLoading(false));
        console.error(err);
        toast.error(`Failed to hide item. \n ${err.message}`);
      });
  }, [params]);

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
    [params]
  );

  // create the actions for this document based on the current user's
  // permissions status and the current doc's status
  const actions = useCallback(() => {
    const actions: (Iaction | null)[] = [
      {
        label: 'Discard changes & refresh',
        type: 'icon',
        icon: <ArrowClockwise24Regular />,
        action: () => params.refetchData(),
      },
      {
        label: params.watch.isWatching || params.watch.isMandatoryWatcher ? 'Stop Watching' : 'Watch',
        type: 'button',
        icon:
          params.watch.isWatching || params.watch.isMandatoryWatcher ? (
            <EyeHide24Regular />
          ) : (
            <EyeShow24Regular />
          ),
        action: () => toggleWatchItem(!params.watch.isWatching),
        disabled: params.watch.isMandatoryWatcher || params.actionAccess?.watch !== true,
        'data-tip': params.watch.isMandatoryWatcher
          ? `You cannot stop watching this document because you are in one of the following groups: ${params.watch.mandatoryWatchersList}`
          : undefined,
      },
      {
        label: 'Delete',
        type: 'button',
        icon: <Delete24Regular />,
        action: () => hideItem(),
        color: 'red',
        disabled: params.actionAccess?.hide !== true,
      },
      {
        label: 'Save',
        type: 'button',
        icon: <Save24Regular />,
        action: () =>
          saveChanges(params.collectionName, params.itemId, {
            dispatch: params.dispatch,
            refetch: params.refetchData,
            state: params.state,
          }),
        disabled: !params.state.isUnsaved || params.actionAccess?.modify !== true,
        'data-tip':
          params.actionAccess?.modify !== true
            ? `You cannot save this document because you do not have permission.`
            : !params.state.isUnsaved
            ? `There are no changes to save.`
            : undefined,
      },
      {
        label: 'Publish',
        type: 'button',
        icon: <CloudArrowUp24Regular />,
        action: () => null,
        disabled: params.canPublish !== true,
        'data-tip':
          params.canPublish !== true
            ? `You cannot publish this document because you do not have permission.`
            : undefined,
      },
    ];
    return actions.filter((action): action is Iaction => !!actions);
  }, [hideItem, params, toggleWatchItem])();

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
            .filter((action) => action.label !== 'Save' && action.label !== 'Publish')
            .map((action) => {
              return {
                onClick: () => action.action(),
                label: action.label,
                color: action?.color || 'primary',
                disabled: action.disabled,
                icon: action.icon,
                'data-tip': action['data-tip'],
              };
            }) || []
        }
      />
    );
  });

  // create a list that only includes save and publish actions
  // so that these actions can be used in conjunction with
  // the dropdown
  const quickActions = [
    actions.find((action) => action?.label === 'Save'),
    actions.find((action) => action?.label === 'Publish'),
  ].filter((action): action is Iaction => !!action);

  return { actions, quickActions, showActionDropdown };
}

export { useActions };
