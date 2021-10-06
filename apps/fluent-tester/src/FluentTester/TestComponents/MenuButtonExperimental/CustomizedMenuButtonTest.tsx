import * as React from 'react';
import { MenuButton } from '@fluentui-react-native/experimental-menu-button';
import { Text, View, Platform } from 'react-native';
import { menuItems, iconProps, testImage } from './testData';
import { viewWrapperStyle, columnStyle, rowStyle, textColor } from './MenuButtonTestStyles';
import { IconSourcesType } from '@fluentui-react-native/icon';

export const CustomizedMenuButton: React.FunctionComponent = () => {
  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const onItemClick = React.useCallback(
    key => {
      setLastMenuItemClicked(key);
    },
    [setLastMenuItemClicked],
  );

  const iconToShow: IconSourcesType = Platform.select({
    macos: testImage, //GH #931, macOS MenuButton only supports showing PNG icons
    default: { ...iconProps, color: '#fff' },
  });

  const StyledMenuButton = MenuButton.customize({
    backgroundColor: 'red',
    borderRadius: 10,
    color: '#fff',
    borderWidth: 4,
    borderColor: '#000',
    variant: 'heroSemibold',
    iconColor: '#fff',
    primary: {
      backgroundColor: 'yellow',
      color: '#000',
      iconColor: '#000',
    },
  });
  return (
    <View>
      <View style={viewWrapperStyle}>
        <View style={columnStyle}>
          <Text>
            <Text>Last Menu Item Clicked: </Text>
            {lastMenuItemClicked > 0 ? <Text style={textColor}>{lastMenuItemClicked}</Text> : <Text style={textColor}>none</Text>}
          </Text>
          <View style={rowStyle}>
            <Text>MenuButton with customized UI</Text>
          </View>
        </View>
      </View>
      <StyledMenuButton
        content="styled MenuButton"
        menuItems={menuItems}
        onItemClick={onItemClick}
        icon={iconToShow}
        tooltip="This is tooltip"
      />
      <StyledMenuButton content="primary MenuButton" menuItems={menuItems} onItemClick={onItemClick} icon={iconToShow} primary />
    </View>
  );
};
