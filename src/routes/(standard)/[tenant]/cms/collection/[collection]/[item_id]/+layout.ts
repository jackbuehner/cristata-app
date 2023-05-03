import { query } from '$graphql/query';
import { server } from '$utils/constants';
import { deepen } from '$utils/deepen';
import { genAvatar } from '$utils/genAvatar';
import { getProperty } from '$utils/objectPath';
import { isTypeTuple, type DeconstructedSchemaDefType } from '@jackbuehner/cristata-generator-schema';
import { uncapitalize } from '@jackbuehner/cristata-utils';
import ColorHash from 'color-hash';
import gql from 'graphql-tag';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import type { LayoutLoad } from './$types';

// @ts-expect-error 'bkdr' is a vlid hash config value
const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5, hash: 'bkdr' });

export const load = (async ({ parent, params, url }) => {
  const { authUser, sessionId, collection } = await parent();

  const accessorOne = collection.config.by?.one || '_id';

  const docData = query<{
    doc?: Record<string, unknown>;
    actionAccess: Record<'modify' | 'modify' | 'hide' | 'lock' | 'watch' | 'archive' | 'publish', boolean>;
  }>({
    fetch,
    tenant: params.tenant,
    query: gql(
      jsonToGraphQLQuery({
        query: {
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

  const processSchemaDef = (args?: {
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
        .filter(([, def]) => {
          if (opts.showHidden) return true;
          if (opts.isPublishModal) return def.field?.hidden === 'publish-only';
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
        .map(([key, def]) => {
          return [key, def] as [string, typeof def];
        })
    );
  };

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

  return {
    yuser,
    params,
    url,
    docData,
    helpers: {
      processSchemaDef,
      calcPublishPermissions,
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
