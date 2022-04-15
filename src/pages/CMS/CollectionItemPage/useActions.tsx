import { ApolloQueryResult, OperationVariables } from '@apollo/client';
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
import { Menu } from '../../../components/Menu';
import { useDropdown } from '../../../hooks/useDropdown';
import { Iaction } from '../ItemDetailsPage/ItemDetailsPage';

interface UseActionsParams {
  actionAccess: Record<keyof CollectionPermissions, boolean | undefined> | undefined;
  canPublish: boolean;
  watch: {
    isMandatoryWatcher: boolean;
    isWatching: boolean;
    mandatoryWatchersList: string;
  };
  isUnsaved: boolean;
  refetchData: (variables?: Partial<OperationVariables> | undefined) => Promise<ApolloQueryResult<any>>;
}

interface UseActionsReturn {
  actions: Iaction[];
  quickActions: Iaction[];
  showActionDropdown: ReturnType<typeof useDropdown>[0];
}

function useActions(params: UseActionsParams): UseActionsReturn {
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
        action: () => null,
        disabled: params.watch.isMandatoryWatcher || params.actionAccess?.watch !== true,
        'data-tip': params.watch.isMandatoryWatcher
          ? `You cannot stop watching this document because you are in one of the following groups: ${params.watch.mandatoryWatchersList}`
          : undefined,
      },
      {
        label: 'Delete',
        type: 'button',
        icon: <Delete24Regular />,
        action: () => null,
        color: 'red',
        disabled: params.actionAccess?.hide !== true,
      },
      {
        label: 'Save',
        type: 'button',
        icon: <Save24Regular />,
        action: () => null,
        disabled: !params.isUnsaved || params.actionAccess?.modify !== true,
        'data-tip':
          params.actionAccess?.modify !== true
            ? `You cannot save this document because you do not have permission.`
            : !params.isUnsaved
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
  }, [params])();

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
