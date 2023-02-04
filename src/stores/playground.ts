import type { GraphQLSchema } from 'graphql';
import { writable } from 'svelte/store';

export const playground = writable<PlaygroundStore>({});
export const playgroundActions = writable<PlaygroundActionsStore>({});

interface PlaygroundStore {
  schema?: GraphQLSchema;
  state?: {
    query?: string;
    docExplorerOpen?: boolean;
  };
}

interface PlaygroundActionsStore {
  handlePrettifyQuery?: () => void;
  handleToggleDocs?: () => void;
  handleEditorRunQuery?: () => void;
}
