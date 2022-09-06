describe('Button Test Suite', () => {
  it('FInd Button', () => {
    driver.pause(5000);
    // const elements = browser.$$('//*');
    // for(let i = 0; i < 30; i++)
    // {
    //   console.log('\nName: ' + elements[i].getAttribute('name') + '\n');
    // }
    //console.log('\n\nLength of elements: ' + elements.length + '\n\n');
    const selector = `name == 'Checkbox'`
    const MyButton = $(`-ios predicate string:${selector}`)
    //const MyButton = $('//*[@name="ActivityIndicator]');
    MyButton.click();
    driver.pause(5000);
    console.log('\n\nControlType: ' + MyButton.getAttribute('type'));
    // driver.waitUntil(
    //   () => $('~test').isDisplayed(),
    // )
    expect(true).toBeTrue();
  })
})