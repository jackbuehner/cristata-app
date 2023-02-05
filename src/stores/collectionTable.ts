import { writable } from 'svelte/store';

export const collectionTableActions = writable<CollectionTableActionsStore | null>(null);

interface CollectionTableActionsStore {
  /**
   * Refetch the data for the table.
   *
   * The number of rows will be reduced to the standard length when the data is fetchd.
   */
  refetchData(): void;
  /**
   * Reset the table sort filters back to default.
   */
  resetSort(): void;
  getPermissions():
    | undefined
    | {
        archive?: boolean;
        hide?: boolean;
        create?: boolean;
      };
}
