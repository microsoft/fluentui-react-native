describe('Button Test Suite', () => {
  it('FInd Button', async () => {
    driver.pause(5000);
    // const elements = browser.$$('//*');
    // for(let i = 0; i < 30; i++)
    // {
    //   console.log('\nName: ' + elements[i].getAttribute('name') + '\n');
    // }
    //console.log('\n\nLength of elements: ' + elements.length + '\n\n');
    // const selector = `name == 'Checkbox'`
    // const MyButton = await $(`-ios predicate string:${selector}`)
    // //const MyButton = $('//*[@name="ActivityIndicator]');
    // //await MyButton.click();
    // driver.pause(5000);
    // console.log('\n\n UID: ' + await MyButton.getAttribute('UID')) + '\n\n';
    // console.log('\n\n Label: ' + await MyButton.getAttribute('label')) + '\n\n';
    // console.log('\n\n Name: ' + await MyButton.getAttribute('name')) + '\n\n';
    // console.log('\n\n Value: ' + await MyButton.getAttribute('value')) + '\n\n';
    // console.log('\n\n wdLabel: ' + await MyButton.getAttribute('wdLabel')) + '\n\n';
    // console.log('\n\n wdName: ' + await MyButton.getAttribute('wdName')) + '\n\n';
    // console.log('\n\n wdUID: ' + await MyButton.getAttribute('wdUID')) + '\n\n';
    // driver.waitUntil(
    //   () => $('~test').isDisplayed(),
    // )
    const MyButton1 = await $('~Homepage_Button_Button');
    await MyButton1.click();
    driver.pause(5000);
    await expect(true).toBeTrue();
  })
})