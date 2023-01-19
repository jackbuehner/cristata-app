import { Extension } from '@tiptap/core';
import { Deletion, DeletionEventHandler, DeletionOptions } from './';

interface DeletionKitOptions extends Partial<DeletionOptions> {}

const DeletionKit = Extension.create<DeletionKitOptions>({
  name: 'deletionKit',

  addExtensions() {
    return [Deletion, DeletionEventHandler];
  },
});

export { DeletionKit };
export type { DeletionKitOptions };
