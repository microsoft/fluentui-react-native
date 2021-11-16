# Tabs

## Purpose

The Tabs control and related tabs pattern are used for navigating frequently accessed, distinct content categories. Tabs allow for navigation between two or more content views and relies on text headers to articulate the different sections of content.
Selecting a tab item header navigates to that header's section content.

## Do's:

- Use on content-heavy views that require a significant amount of scrolling to access the various sections.
- Be concise on the navigation header texts, ideally one or two words rather than a phrase.
- Make sure all the children of the Tabs component are of type TabItem.

## Don't:

- Nest with other RadioGroup or Checkboxes. If possible, keep all the options at the same level.
- Use on Views which don’t scroll.
- Use the Tabs to access a different global view.
- Use the Tabs to access hidden content.
- Pass any children of type other than TabItem to the Tabs component.

## Sample Code:

```jsx
<Tabs>
  <TabsItem headerText="Home" itemKey="A">
    <Text>Tabs #1</Text>
  </TabsItem>
  <TabsItem headerText="Files" itemKey="B">
    <Text>Tabs #2</Text>
  </TabsItem>
  <TabsItem headerText="Settings" itemKey="C">
    <Text>Tabs #3</Text>
  </TabsItem>
</Tabs>
```

## Props:

### Tabs Component:

| Prop               | Type                                   | Default Value | Description                                                                                                                                                                                                                                                                                         |
| ------------------ | -------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| defaultSelectedKey | string                                 |               | The key of the TabsItem that will initially be selected.                                                                                                                                                                                                                                            |
| label              | string                                 |               | Descriptive label for the Tabs. This will be displayed as the title of the Tabs to the user.                                                                                                                                                                                                        |
| accessibilityLabel | string                                 |               | An accessibility label for screen readers. If not provided, it will be set to the label of the Tabs.                                                                                                                                                                                                |
| selectedKey        | string                                 |               | The key of the selected option. If you provide this, you must maintain selection state by observing onTabsClick events and passing a new value in when changed. This overrides defaultSelectedKey and makes the Tabs a controlled component. This prop is mutually exclusive to defaultSelectedKey. |
| onTabsClick        | (key: string) => void                  |               | Callback for receiving a notification when the choice has been changed.                                                                                                                                                                                                                             |
| getTabId           | (key: string, index: number) => string |               | Callback to customize how IDs are generated for each tab header. Useful if you're rendering content outside and need to connect accessibility-labelledby.                                                                                                                                           |
| headersOnly        | boolean                                | false         | Sets whether to only render the header.                                                                                                                                                                                                                                                             |
| componentRef       | React.RefObject<View>                  |               | A RefObject to access Tabs.                                                                                                                                                                                                                                                                         |

### TabsItem Component:

| Prop         | Type                                              | Default Value | Description                                                                                                            |
| ------------ | ------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| headerText   | string                                            |               | The text string for the option.                                                                                        |
| itemCount    | number                                            |               | The number for the TabsItem count.                                                                                     |
| itemKey      | string                                            |               | A unique key-identifier for each option.                                                                               |
| disabled     | boolean                                           |               | Whether or not the tabs item is selectable.                                                                            |
| componentRef | React.RefObject<IFocusable>                       |               | A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component. |
| getTabId     | (key: string, index: number) => string            |               | Call                                                                                                                   |
| icon         | IconSourcesType = (number or string or IconProps) |               | Source URL or name of the icon to show on the TabsItem.                                                                |

### IconProps Interface

| Prop              | Type                               |
| ----------------- | ---------------------------------- |
| fontSource        | FontIconProps                      |
| svgSource         | SvgIconProps                       |
| rasterImageSource | RasterImageIconProps               |
| style             | StyleProp<ImageStyle or TextStyle> |
| width             | number                             |
| height            | number                             |
| color             | ColorValue                         |

### FontIconProps Interface

| Prop        | Type   |
| ----------- | ------ |
| fontFamily  | string |
| fontSrcFile | string |
| codepoint   | number |
| fontSize    | number |

### SvgIconProps Interface

| Prop    | Type               |
| ------- | ------------------ |
| uri     | string             |
| src     | React.FC<SvgProps> |
| viewBox | string             |

### RasterImageIconProps Interface

| Prop | Type                 |
| ---- | -------------------- |
| src  | ImageProps['source'] |

## Tokens:

Tabs supports the following tokens:

1. backgroundColor – This changes the background color of Tabs.
2. color – This changes the text color of the label associated with Tabs.
3. fontFamily – This changes the font family of the label associated with Tabs.
4. fontSize – This changes the font size of the label associated with Tabs.
5. fontWeight – This changes the font weight of the label associated with Tabs.
6. variant – This sets the styling of Tabs to a specific configuration.

TabsItem supports the following tokens:

1. backgroundColor – This changes the background color of the TabsItem.
2. borderColor – This changes the border color of the TabsItem.
3. borderRadius – This changes the border radius of the TabsItem.
4. borderStyle – This changes the border style of the TabsItem.
5. borderWidth – This changes the border width of the TabsItem.
6. color – This changes the text color of the header associated with the TabsItem.
7. fontFamily – This changes the font family of the header associated with the TabsItem.
8. fontSize – This changes the font size of the header associated with the TabsItem.
9. fontWeight – This changes the font weight of the header associated with the TabsItem.
10. headerText – This sets the text to show on the TabsItem.
11. headerTextPadding – This changes the amount of padding between the border and the headerText.
12. headerTextPaddingFocused – This changes the amount of padding between the border and the headerText when the TabsItem has focus.
13. icon – This sets the icon to show on the TabsItem.
14. iconColor – This changes the color of the TabsItem’s icon.
15. indicatorColor – This changes the color of the TabsItem's selected indicator.
16. variant – This sets the styling of the TabsItem to a specific configuration.
