import { goto } from '$app/navigation';
import { queryWithStore } from '$graphql/query';
import { server } from '$utils/constants';
import { deepen } from '$utils/deepen';
import { genAvatar } from '$utils/genAvatar';
import { getProperty } from '$utils/objectPath';
import { isTypeTuple, type DeconstructedSchemaDefType } from '@jackbuehner/cristata-generator-schema';
import { notEmpty, slugify, uncapitalize } from '@jackbuehner/cristata-utils';
import _ColorHash from 'color-hash';
import { print } from 'graphql';
import gql from 'graphql-tag';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import pluralize from 'pluralize';
import type { LayoutLoad } from './$types';

// @ts-expect-error https://github.com/zenozeng/color-hash/issues/42
const ColorHash: typeof _ColorHash = _ColorHash.default || _ColorHash;
// @ts-expect-error 'bkdr' is a vlid hash config value
const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.34, hash: 'bkdr' });

export const load = (async ({ parent, params, url }) => {
  const { authUser, sessionId, collection } = await parent();

  const accessorOne = collection.config.by?.one || '_id';

  const docData = queryWithStore<{
    doc?: Record<string, unknown>;
    actionAccess: Record<'modify' | 'modify' | 'hide' | 'lock' | 'watch' | 'archive' | 'publish', boolean>;
  }>({
    fetch,
    tenant: params.tenant,
    query: gql(
      jsonToGraphQLQuery({
        query: {
          __name: `${collection.schemaName}DocData${slugify(params.item_id)}`,
          doc: {
            // we alias to "doc" so the accessor for the data is always the same
            __aliasFor: uncapitalize(collection.schemaName),
            __args: {
              [accessorOne]: params.item_id,
            },
            ...merge(
              {
                [accessorOne]: true,
              },
              ...collection.deconstructedSchema.map(docDefsToQueryObjectLight)
            ),
          },
          actionAccess: {
            __aliasFor: uncapitalize(collection.schemaName) + 'ActionAccess',
            modify: true,
            hide: true,
            lock: true,
            watch: true,
            archive: true,
            publish: true,
          },
        },
      })
    ),
    useCache: false,
    waitForQuery: true,
    clearStoreBeforeFetch: false,
  });

  // create a user object for the current user (for yjs)
  const yuser = {
    name: authUser.name,
    color: colorHash.hex(authUser._id.toHexString()),
    sessionId: sessionId || '',
    _id: authUser._id.toHexString(),
    photo:
      `${server.location}/v3/${params.tenant}/user-photo/${authUser._id.toHexString()}` ||
      genAvatar(authUser._id.toHexString()),
  };

  const processSchemaDef = ((args?: {
    schemaDef?: DeconstructedSchemaDefType;
    collapsed?: boolean;
    isPublishModal?: boolean;
    showHidden?: boolean;
  }): DeconstructedSchemaDefType => {
    const { schemaDef, ...opts } = args || {};

    return (
      (schemaDef || collection.deconstructedSchema)
        .map(([key, def]) => {
          const labelDef = def.docs?.find(([ckey]) => ckey.replace(key + '.', '') === '#label')?.[1];
          return [key, def, labelDef] as [string, typeof def, typeof labelDef];
        })
        // sort fields to match their order
        .sort((a, b) => {
          const orderA = parseInt(`${a[1].field?.order || 1000}`);
          const orderB = parseInt(`${b[1].field?.order || 1000}`);
          return orderA > orderB ? 1 : -1;
        })
        // hide hidden fields
        .filter(([, def, labelDef]) => {
          if (opts.showHidden) return true;
          if (opts.isPublishModal) return def.field?.hidden === 'publish-only';
          if (labelDef) return labelDef.field?.hidden !== true && def.field?.hidden !== 'publish-only';
          return def.field?.hidden !== true && def.field?.hidden !== 'publish-only';
        })
        // remove fields that are used in the sidebar
        .filter(([key]) => {
          if (key === 'stage') return false;
          if (key === 'permissions.users') return false;
          if (key === 'permissions.teams') return false;
          return true;
        })
        // remove timestamps related to publishing
        .filter(([key]) => {
          return key !== 'timestamps.published_at' && key !== 'timestamps.updated_at';
        })
        .filter(([key, def, labelDef]) => {
          if (opts.collapsed === true)
            return def.field?.collapsed === true || labelDef?.field?.collapsed === true;
          if (opts.collapsed === false)
            return def.field?.collapsed !== true && labelDef?.field?.collapsed !== true;
          return true;
        })
        .map(([key, def, labelDef]) => {
          if (labelDef && labelDef.field) {
            return [key, { ...def, field: { ...(def.field || {}), ...labelDef.field } }] as [
              string,
              typeof def
            ];
          }
          return [key, def] as [string, typeof def];
        })
    );
  }) satisfies ProcessSchemaDef;

  const calcPublishPermissions = (params: CalcPublishPermissionsParams): CalcPublishPermissionsReturn => {
    const canPublish = params.publishActionAccess === true;
    const cannotPublish = params.publishActionAccess !== true;

    const stageSchemaDef = collection.deconstructedSchema.find(([key]) => key === 'stage')?.[1];
    const stageFieldOptions = stageSchemaDef?.field?.options;
    const stageFieldOptionsAscendingOrder = stageFieldOptions?.sort((a, b) => {
      if (a.value.toString() > b.value.toString()) return -1;
      return 1;
    });

    const lastStage = parseFloat(stageFieldOptionsAscendingOrder?.[0]?.value?.toString() || '0') || undefined;
    const currentStage =
      parseFloat(getProperty(params.itemStateFields, 'stage')?.toString() || '0') || undefined;

    // if true, lock the publishing capability because the current user does not have permission
    const publishLocked = collection.config.canPublish && cannotPublish && currentStage === lastStage;

    return { canPublish, publishStage: lastStage, currentStage, publishLocked };
  };

  interface CalcWatchingReturn {
    /**
     * Whether the current user is currently watching this document.
     */
    isWatcher: boolean;
    /**
     * Whether the current user has opted in to watching this document.
     */
    isOptionalWatcher: boolean;
    /**
     * Whether the current user is forced to watch this document.
     */
    isMandatoryWatcher: boolean;
    /**
     * A list of document data keys that contain lists of users
     * who are mandatory watchers.
     */
    mandatoryWatchersKeys: string[];
  }

  /**
   * Gets information about the current watchers of this document.
   * Requires providing the shared document data.
   */
  const calcWatching = (sharedData: Record<string, unknown> = {}): CalcWatchingReturn => {
    // get watchers array of strings and enure type is correct
    let watchers: string[] = (getProperty(sharedData, 'people.watching') as string[]) || [];
    if (!Array.isArray(watchers)) watchers = [];
    else {
      watchers = watchers
        .map((watcher) => {
          if (typeof watcher === 'string') return watcher;
          return null;
        })
        .filter(notEmpty);
    }

    // get a list of mandatory watchers by retreiving user ids from
    // the specified keys that contain user ids
    const mandatoryWatchersKeys = (collection.config.options.mandatoryWatchers || []).filter(notEmpty);
    const mandatoryWatchers = mandatoryWatchersKeys
      .map((key) => getProperty(sharedData, key))
      .filter((watcher): watcher is string => typeof watcher === 'string');

    // check if the currently authenticated user is a watcher or mandatory watcher
    // by seeing if the user's _id is inside the watchers list
    const isOptionalWatcher = watchers.includes(authUser._id.toHexString());
    const isMandatoryWatcher = mandatoryWatchers.includes(authUser._id.toHexString());

    return {
      isWatcher: isOptionalWatcher || isMandatoryWatcher,
      isOptionalWatcher,
      isMandatoryWatcher,
      mandatoryWatchersKeys,
    };
  };

  /**
   * Set the item to be hidden.
   *
   * This is used to hide the doc from the list of viewable docs in the
   * collection without completely deleting it. This is useful as a
   * "soft" deletion that can be undone because the data is not actually
   * deleted.
   */
  const hideDoc = async (hide = true) => {
    const HIDE_ITEM = gql`mutation {
      ${uncapitalize(collection.schemaName)}Hide(${accessorOne || '_id'}: "${params.item_id}", hide: ${hide}) {
        hidden
      }
    }`;

    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: print(HIDE_ITEM) }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error'));
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.error(err);
        if (hide) {
          return `Failed to hide document. \n ${err.message}`;
        } else {
          return `Failed to restore document. \n ${err.message}`;
        }
      });
  };

  /**
   * Set whether the item is archived.
   */
  const archiveDoc = async (archive = true) => {
    const ARCHIVE_ITEM = gql`mutation {
      ${uncapitalize(collection.schemaName)}Archive(${accessorOne || '_id'}: "${
      params.item_id
    }", archive: ${archive}) {
        archived
      }
    }`;

    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: print(ARCHIVE_ITEM) }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error'));
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.error(err);
        if (archive) {
          return `Failed to archive document. \n ${err.message}`;
        } else {
          return `Failed to unarchive document. \n ${err.message}`;
        }
      });
  };

  /**
   * Clones a document.
   */
  const cloneDoc = async () => {
    const CLONE_ITEM = gql`mutation {
      ${uncapitalize(collection.schemaName)}Clone(${accessorOne || '_id'}: "${params.item_id}") {
        ${accessorOne || '_id'}
      }
    }`;

    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: print(CLONE_ITEM) }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error'));
        } else {
          return json;
        }
      })
      .then(({ data }) => {
        const _url = new URL(url.href);
        const newDocId = data[`${uncapitalize(collection.schemaName)}Clone`][`${accessorOne || '_id'}`];
        const newDocPath = `${params.tenant}/cms/collection/${pluralize(
          uncapitalize(collection.schemaName)
        )}/${newDocId}`;
        _url.pathname = newDocPath;
        goto(_url);
        return null;
      })
      .catch((err) => {
        console.error(err);
        return `Failed to clone document. \n ${err.message}`;
      });
  };

  /**
   * Toggle whether the current user is watching this document.
   *
   * This adds or removes the current user from the list of people
   * who receive notification when this document changes.
   */
  const toggleWatchDoc = async (watch: boolean) => {
    const WATCH_ITEM = gql`mutation {
      ${uncapitalize(collection.schemaName)}Watch(${accessorOne || '_id'}: "${params.item_id}") {
        people {
          watching {
            _id
          }
        }
      }
    }`;
    const UNWATCH_ITEM = gql`mutation {
      ${uncapitalize(collection.schemaName)}Watch(${accessorOne || '_id'}: "${params.item_id}", watch: false) {
        people {
          watching {
            _id
          }
        }
      }
    }`;

    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: print(watch === true ? WATCH_ITEM : UNWATCH_ITEM) }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error'));
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.error(err);
        if (watch) {
          return `Failed to start watching this document. \n ${err.message}`;
        } else {
          return `Failed to stop watching this document. \n ${err.message}`;
        }
      });
  };

  /**
   * Set the document stage to draft (2.1)
   */
  const setDraftStage = async () => {
    const SET_READY_STAGE = gql`mutation {
      ${uncapitalize(collection.schemaName)}Modify(${accessorOne || '_id'}: "${
      params.item_id
    }", input: { stage: 2.1 }) {
        stage
      }
    }`;

    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: print(SET_READY_STAGE) }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error'));
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.error(err);
        return `Failed to begin an update session. \n ${err.message}`;
      });
  };

  /**
   * Unpublish the document and set the stage to 2.1.
   */
  const unpublishDoc = async () => {
    const UNPUBLISH_ITEM = gql`mutation {
      ${uncapitalize(collection.schemaName)}Publish(${accessorOne || '_id'}: "${
      params.item_id
    }", publish: false) {
        ${accessorOne || '_id'}
      }
    }`;

    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: print(UNPUBLISH_ITEM) }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error'));
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.error(err);
        return `Failed to unpublish document. \n ${err.message}`;
      });
  };

  return {
    yuser,
    params,
    url,
    docData,
    helpers: {
      processSchemaDef,
      calcPublishPermissions,
      colorHash,
      calcWatching,
    },
    actions: {
      hideDoc,
      archiveDoc,
      cloneDoc,
      toggleWatchDoc,
      setDraftStage,
      unpublishDoc,
    },
  };
}) satisfies LayoutLoad;

function docDefsToQueryObjectLight(
  input: DeconstructedSchemaDefType[0],
  index: number,
  arr: DeconstructedSchemaDefType
): ReturnType<typeof deepen> {
  const [key, def] = input;

  const isSubDocArray = def.type === 'DocArray';
  const isObjectType = isTypeTuple(def.type);

  // get the reference fields that are forced by the config
  if (isObjectType && def.field?.reference) {
    return merge(
      {},
      ...(def.field.reference.forceLoadFields || []).map((field) => deepen({ [key + '.' + field]: true }))
    );
  }

  // send subdoc arrays through this function
  if (isSubDocArray) {
    return merge<Record<string, never>, Record<string, never>[]>(
      {},
      ...def.docs.map(([key, def], index, arr) => {
        return docDefsToQueryObjectLight([key, def], index, arr);
      })
    );
  }

  // require the _id field if no other field is required in the def
  return deepen({ _id: true });
}

interface CalcPublishPermissionsParams {
  publishActionAccess?: boolean;
  itemStateFields: Record<string, unknown>;
}

interface CalcPublishPermissionsReturn {
  /**
   * Whether the current user has permission to publish this document.
   */
  canPublish: boolean;
  /**
   * The last stage in the stage field options, which is considered the stage
   * for documents that are published.
   */
  publishStage: number | undefined;
  /**
   * The current stage of the current document.
   */
  currentStage: number | undefined;
  /**
   * Lock the document to read-only mode because it is currently published
   * and the current user does not have permission to edit publish documents.
   */
  publishLocked: boolean;
}

export type ProcessSchemaDef = (args?: {
  schemaDef?: DeconstructedSchemaDefType;
  collapsed?: boolean;
  isPublishModal?: boolean;
  showHidden?: boolean;
}) => DeconstructedSchemaDefType;

export interface Action {
  id: string;
  label: string;
  icon?: string;
  action: (evt: MouseEvent | TouchEvent | KeyboardEvent | CustomEvent<any>) => void | Promise<void>;
  loading?: boolean;
  onAuxClick?: (evt: MouseEvent) => void;
  disabled?: boolean;
  tooltip?: string;
  hint?: string;
  // showChevron?: boolean;
}
