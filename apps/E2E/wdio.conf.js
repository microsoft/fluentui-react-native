/**
 * @typedef { { driver: string } } PlatformData
 */

/**
 * @type { Record<string, PlatformData> }
 */
const platformData = {
  windows: { driver: 'windows' },
  macos: { driver: 'mac2' },
  ios: { driver: 'xcuitest' },
  android: { driver: 'uiautomator2' },
  win32: { driver: 'windows' },
};

exports.platformData = platformData;
