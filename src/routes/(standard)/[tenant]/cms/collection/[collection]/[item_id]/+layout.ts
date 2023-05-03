import { server } from '$utils/constants';
import { genAvatar } from '$utils/genAvatar';
import type { DeconstructedSchemaDefType } from '@jackbuehner/cristata-generator-schema';
import ColorHash from 'color-hash';
import type { LayoutLoad } from './$types';

// @ts-expect-error 'bkdr' is a vlid hash config value
const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5, hash: 'bkdr' });

export const load = (async ({ parent, params, url }) => {
  const { authUser, sessionId, collection } = await parent();

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

  return {
    yuser,
    params,
    url,
    helpers: {
      processSchemaDef,
    },
  };
}) satisfies LayoutLoad;
