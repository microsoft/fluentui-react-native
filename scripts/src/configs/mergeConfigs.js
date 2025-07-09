/**
 * @typedef {string | number | symbol} KeyType
 * @typedef {Record<KeyType, unknown>} GenericObject
 */

/**
 *
 * @param {GenericObject} obj1
 * @param {GenericObject} obj2
 * @returns {GenericObject}
 */
export function mergeConfigs(obj1, obj2) {
  const merged = Object.assign({}, obj1, obj2);

  for (const prop in obj2) {
    const sourceValue = obj2[prop];
    const targetValue = obj1[prop];
    if (sourceValue && targetValue) {
      if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        merged[prop] = targetValue.concat(sourceValue);
      } else if (typeof targetValue === 'object' && typeof sourceValue === 'object') {
        merged[prop] = mergeConfigs(/** @type {GenericObject} */ (targetValue), /** @type {GenericObject} */ (sourceValue));
      }
    }
  }

  return merged;
}
