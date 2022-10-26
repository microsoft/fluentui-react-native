import { Attribute, MobilePlatform, NativePlatform, Platform, ROOT_VIEW } from './consts';

const rootSearchFunctions: { [platform in Platform]: () => Promise<WebdriverIO.Element | null> | null } = {
  [NativePlatform.Win32]: async () => {
    // we know that our tester window will have a class name = sdxtestapp
    const windowRefs = await driver.findElements('class name', 'sdxtestapp');
    for (const ref of windowRefs) {
      const window = await $(ref);
      // we want to look for a window that contains a view with automation id = ROOT_VIEW, as that will be our tester window
      const viewQuery = await window.$('~' + ROOT_VIEW);
      if (!viewQuery.error) {
        // no errors :)
        return window;
      }
    }
    // we weren't able to find our window :(
    return null;
  },
  [NativePlatform.Win32]: null,
  [NativePlatform.Windows]: async () => {
    // uwp window frames have class name = ApplicationFrameWindow
    const windowRefs = await driver.findElements('class name', 'ApplicationFrameWindow');
    // our window will be named 'ReactTestApp'
    for (const ref of windowRefs) {
      const window = await $(ref);
      const windowName = await window.getAttribute(Attribute.AccessibilityLabel);
      if (windowName === 'ReactTestApp') {
        return window;
      }
    }
    // we weren't able to find our window :(
    return null;
  },
  [NativePlatform.macOS]: null,
  [MobilePlatform.iOS]: null,
  [MobilePlatform.Android]: null,
};

export default async function findRoot(platform: Platform): Promise<WebdriverIO.Element | null> {
  const searchFunction = rootSearchFunctions[platform];
  if (searchFunction === null) {
    throw new Error(`Platform '${platform}' has no root search function implemented. Element queries will start at the top of the tree.`);
  }
  return await searchFunction();
}
