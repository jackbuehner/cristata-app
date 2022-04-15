import { useMemo } from 'react';
import { get as getProperty } from 'object-path';
import { CmsItemState } from '../../../redux/slices/cmsItemSlice';
import { SchemaDef } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';

interface UsePublishPermissionsParams {
  publishActionAccess?: boolean;
  isPublishableCollection: boolean;
  itemStateFields: CmsItemState['fields'];
  schemaDef: [string, SchemaDef][];
}

interface UsePublishPermissionsReturn {
  /**
   * Whether the current user has permission to publish this document.
   */
  canPublish: boolean;
  /**
   * The last stage in the stage field options, which is considered the stage
   * for documents that are published.
   */
  lastStage: number | undefined;
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

function usePublishPermissions(params: UsePublishPermissionsParams): UsePublishPermissionsReturn {
  return useMemo<UsePublishPermissionsReturn>(() => {
    const canPublish = params.publishActionAccess === true;
    const cannotPublish = params.publishActionAccess !== true;

    const stageSchemaDef = params.schemaDef.find(([key]) => key === 'stage')?.[1];
    const stageFieldOptions = stageSchemaDef?.field?.options;
    const stageFieldOptionsAscendingOrder = stageFieldOptions?.sort((a, b) => {
      if (a.value.toString() > b.value.toString()) return 1;
      return -1;
    });

    const lastStage = parseFloat(stageFieldOptionsAscendingOrder?.[0]?.value?.toString() || '0') || undefined;
    const currentStage =
      parseFloat(getProperty(params.itemStateFields, 'stage')?.toString() || '0') || undefined;

    // if true, lock the publishing capability because the current user does not have permission
    const publishLocked = params.isPublishableCollection && cannotPublish && currentStage === lastStage;

    return { canPublish, lastStage, currentStage, publishLocked };
  }, [params.publishActionAccess, params.isPublishableCollection, params.itemStateFields, params.schemaDef]);
}

export { usePublishPermissions };
