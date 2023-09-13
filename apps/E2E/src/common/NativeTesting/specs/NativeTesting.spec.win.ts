import { PAGE_TIMEOUT } from '../../../common/consts';
import NativeTestingPageObject from '../pages/NativeTestingPageObject.win';

describe('Native Safety Check Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await NativeTestingPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  // The ScrollView in testing is the one that contains all the buttons that navigate to each component's
  // test page. This is vital for our native testing, as we grab this ScrollView on the native side and
  // to climb down the UI tree and find all of FURN's testable components.
  // We need to make sure this ScrollView:
  //    1) Continues to parent all the test buttons
  //    2) Keeps testID='SCROLLVIEW_TEST_ID'
  it('Validate the ScrollView containing all the navigational buttons exists', async () => {
    await NativeTestingPageObject.waitForScrollViewDisplayed(PAGE_TIMEOUT);
    await expect(await NativeTestingPageObject.doesScrollViewParentExist()).toBeTruthy(
      'The testing ScrollView containing navigation buttons to individual testPages was not displayed in time.',
    );
  });

  // In addition to existing, we want to ensure the Children of the ScrollView stay intact. The children are the buttons that
  // navigate to each test page. Validate these children exist with the proper testId format.
  it('Validate the children of ScrollView are the buttons that navigate to each test page with proper automationId', async () => {
    await NativeTestingPageObject.waitForScrollViewDisplayed(PAGE_TIMEOUT);
    await expect(await NativeTestingPageObject.validateScrollViewChildren()).toBeTruthy();
  });
});
