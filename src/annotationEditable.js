import { convertIIIFAnnoToMaeData } from './IIIFUtils';

/**
 * Whether an annotation can be edited from the annotation list.
 *
 * An annotation is editable if it was created by MAE (it carries `maeData`), or if it lives in
 * the annotation page served by the configured storage adapter. The latter covers annotations
 * created by other tools and stored in the same backend, which have no `maeData`.
 * Annotations embedded in a manifest (any other page) stay read-only, since the adapter
 * could not update them.
 *
 * @param {object} annotation
 * @param {string} pageId - id under which the annotation's page is stored in Mirador's state
 * @param {string} [adapterPageId] - `annotationPageId` of the storage adapter for the canvas
 * @returns {boolean}
 */
export function isAnnotationEditable(annotation, pageId, adapterPageId) {
  if (!annotation) return false;
  if (annotation.maeData) return true;
  return Boolean(adapterPageId) && pageId === adapterPageId;
}

const maeDataCache = new WeakMap();

/**
 * Give an annotation that lacks `maeData` a synthesized one so the regular MAE templates can
 * edit it. Falls back to the original annotation (edited in the raw IIIF template) when its
 * target can't be converted to a drawable shape.
 *
 * The input is never mutated (it belongs to Mirador's store); results are cached per object.
 *
 * @param {object} annotation
 * @returns {object}
 */
export function withMaeData(annotation) {
  if (!annotation || annotation.maeData) return annotation;
  if (maeDataCache.has(annotation)) return maeDataCache.get(annotation);

  let result = annotation;
  if (annotation.target && typeof annotation.target === 'object') {
    const converted = convertIIIFAnnoToMaeData({ ...annotation });
    if (converted.maeData?.target?.drawingState) {
      result = converted;
    }
  }
  maeDataCache.set(annotation, result);
  return result;
}
