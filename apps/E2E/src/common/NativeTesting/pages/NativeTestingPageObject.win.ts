import { BasePage } from '../../../common/BasePage';
import { createDesktopDriverClient, DesktopSessionClient } from '@fluentui-react-native/desktop-driver';
import type { DesktopTreeNode } from '@fluentui-react-native/desktop-driver';
import { isNativeDesktop } from '../../nativeDesktop';
import { TESTPAGE_BUTTONS_SCROLLVIEWER } from '../../consts';

class NativeTestingPageObject extends BasePage {
  async waitForScrollViewDisplayed(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.doesScrollViewParentExist(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg:
        'For testing purposes we require that the root view contains a non-empty, immutable ScrollView of buttons that navigate to test pages.',
      interval: 1000,
    });
  }

  async doesScrollViewParentExist(): Promise<boolean> {
    return await (await this._testPageButtonScrollViewer).isDisplayed();
  }

  /* Validate the Children of the ScrollView stay intact. The children are the buttons that
   * navigate to each test page. Also, validate these children exist with the proper testId format */
  async validateScrollViewChildren(): Promise<boolean> {
    let automationIds: (string | null)[];
    if (isNativeDesktop()) {
      const url = `${browser.options.protocol}://${browser.options.hostname}:${browser.options.port}${browser.options.path}`;
      const session = new DesktopSessionClient(
        createDesktopDriverClient({ url }),
        browser.sessionId,
        Object.fromEntries(Object.entries(browser.capabilities)),
      );
      const flatten = (nodes: readonly DesktopTreeNode[]): DesktopTreeNode[] => nodes.flatMap((node) => [node, ...flatten(node.children)]);
      const scroller = flatten(await session.getTree()).find((node) => node.testId === TESTPAGE_BUTTONS_SCROLLVIEWER);
      if (!scroller) throw new Error('The native tree does not contain the navigation ScrollView.');
      automationIds = flatten(scroller.children).map((node) => node.testId ?? null);
    } else {
      const testChildren = await (await this._testPageButtonScrollViewer).$$('//*');
      automationIds = await testChildren.map((child) => child.getAttribute('AutomationId'));
    }
    let foundValidButton = false;

    // Ensure the testID (maps 1:1 to automationId) properties of the button children match the defined testing format
    const reg = new RegExp('Homepage_[a-zA-Z1-9]*_Button');

    // Iterate through children. Validate at least one valid button exists as a child to the ScrollView.
    // If automationId is found in the wrong format, return false.
    for (const autoId of automationIds) {
      if (autoId && autoId !== TESTPAGE_BUTTONS_SCROLLVIEWER) {
        if (autoId.match(reg)) {
          foundValidButton = true;
        } else {
          // The correct format for testId was not followed. Return a failure.
          throw Error(
            `A testPageButton with the testID '${autoId}' does not match the defined testID format, which should
            read 'Homepage_<component_name>_Button.`,
          );
        }
      }
    }

    return foundValidButton;
  }

  override get _testPage(): ChainablePromiseElement {
    throw new Error('You are trying to read the _testPage getter for NativeTestingPageObject, which is not implemented.');
  }

  override get _pageButton(): ChainablePromiseElement {
    throw new Error('You are trying to read the _pageButton getter for NativeTestingPageObject, which is not implemented.');
  }

  get _pageButtonName(): string {
    throw new Error('You are trying to read the _pageButtonName getter for NativeTestingPageObject, which is not implemented.');
  }

  get _pageName(): string {
    throw new Error('You are trying to read the _pageName getter for NativeTestingPageObject, which is not implemented.');
  }
}

export default new NativeTestingPageObject();
