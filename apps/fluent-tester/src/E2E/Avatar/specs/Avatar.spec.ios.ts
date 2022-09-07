describe('Button Test Suite', () => {
  it('FInd Button', async () => {
    driver.pause(5000);
    const MyButton1 = await $('~Homepage_Button_Button');
    await MyButton1.click();
    driver.pause(5000);
    await expect(true).toBeTrue();
  })
})