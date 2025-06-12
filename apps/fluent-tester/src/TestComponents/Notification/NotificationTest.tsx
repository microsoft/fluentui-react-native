import * as React from 'react';
import { Animated, StyleSheet, Switch, TextInput, View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import type { SvgIconProps } from '@fluentui-react-native/icon';
import type { NotificationVariant } from '@fluentui-react-native/notification';
import { Notification, NotificationVariants } from '@fluentui-react-native/notification';
import { TextV1 as Text } from '@fluentui-react-native/text';

import PlayButton from './assets/play_button.svg';
import { StyledPicker } from '../Common/StyledPicker';
import { commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const svgProps: SvgIconProps = {
  src: PlayButton,
};
const iconProps = { svgSource: svgProps };

const SHOW_HEIGHT = -50;
const BAR_SHOW_DURATION = 300;
const HIDE_DURATION = 250;
const AUTO_HIDE_DURATION = 3000;
const USE_NATIVE_DRIVER_IOS = true;

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    marginBottom: 50,
  },
  notification: {
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
  },
});

const CustomToast: React.FunctionComponent = () => {
  const [variant, setVariant] = React.useState<NotificationVariant>('primary');
  const [title, setTitle] = React.useState("Kat's iPhoneX");
  const [message, setMessage] = React.useState('Listen to Emails • 7 mins');
  const [action, setAction] = React.useState('Listen');

  const [showIcon, setShowIcon] = React.useState(true);
  const [showTitle, setShowTitle] = React.useState(true);

  return (
    <View>
      <StyledPicker
        prompt="Variant"
        selected={variant}
        onChange={setVariant}
        collection={NotificationVariants.filter((variant) => !variant.endsWith('Bar'))}
      />
      <TextInput value={title} onChangeText={setTitle} style={styles.textInput} />
      <TextInput value={message} onChangeText={setMessage} style={styles.textInput} />
      <TextInput value={action} onChangeText={setAction} style={styles.textInput} />
      <View style={commonStyles.switch}>
        <Text>Show icon </Text>
        <Switch value={showIcon} onValueChange={setShowIcon} />
      </View>
      <View style={commonStyles.switch}>
        <Text>Show title </Text>
        <Switch value={showTitle} onValueChange={setShowTitle} />
      </View>
      <View style={styles.notification}>
        <Notification
          variant={variant}
          icon={showIcon ? iconProps : undefined}
          title={showTitle ? title : undefined}
          action={action}
          onPress={() => {
            console.log('Notification tapped');
          }}
          onActionPress={() => {
            console.log('Notification action tapped');
          }}
        >
          {message}
        </Notification>
      </View>
    </View>
  );
};

const CustomBar: React.FunctionComponent = () => {
  const [variant, setVariant] = React.useState<NotificationVariant>('primaryBar');
  const [message, setMessage] = React.useState('Updating...');

  return (
    <View>
      <StyledPicker
        prompt="Variant"
        selected={variant}
        onChange={setVariant}
        collection={NotificationVariants.filter((variant) => variant.endsWith('Bar'))}
      />
      <TextInput value={message} onChangeText={setMessage} style={styles.textInput} />
      <View style={styles.notification}>
        <Notification
          variant={variant}
          onPress={() => {
            console.log('Notification tapped');
          }}
        >
          {message}
        </Notification>
      </View>
    </View>
  );
};

const PrimaryWithAutoHide: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(true);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  const show = React.useCallback(() => {
    setHidden(false);
    Animated.sequence([
      Animated.spring(height, {
        toValue: SHOW_HEIGHT,
        bounciness: 16,
        speed: 20,
        useNativeDriver: USE_NATIVE_DRIVER_IOS,
      }),
      Animated.delay(AUTO_HIDE_DURATION),
      Animated.timing(height, {
        toValue: 0,
        duration: HIDE_DURATION,
        useNativeDriver: USE_NATIVE_DRIVER_IOS,
      }),
    ]).start(() => {
      setHidden(true);
      setVisible(false);
    });
  }, [height]);

  const hide = React.useCallback(() => {
    Animated.timing(height, {
      toValue: 0,
      duration: HIDE_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER_IOS,
    }).start(() => {
      setHidden(true);
    });
  }, [height]);

  React.useLayoutEffect(() => {
    if (visible) {
      show();
    } else {
      hide();
    }
  }, [visible, show, hide]);

  const animatedViewProps = {
    transform: [{ translateY: height }],
  };

  return (
    <View>
      <Button appearance="subtle" onClick={onButtonPress} style={styles.button}>
        {visible ? 'Hide' : 'Show'}
      </Button>
      {!hidden && (
        <Animated.View style={animatedViewProps}>
          <Notification
            variant={'primary'}
            action="Undo"
            onPress={() => {
              console.log('Notification tapped');
            }}
            onActionPress={() => {
              console.log('Undo tapped');
            }}
          >
            Mail Archived
          </Notification>
        </Animated.View>
      )}
    </View>
  );
};
const PrimaryBarWithAutoHide: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(true);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  const show = () => {
    setHidden(false);
    Animated.sequence([
      Animated.timing(height, {
        toValue: SHOW_HEIGHT,
        duration: BAR_SHOW_DURATION,
        useNativeDriver: USE_NATIVE_DRIVER_IOS,
      }),
      Animated.delay(AUTO_HIDE_DURATION),
      Animated.timing(height, {
        toValue: 0,
        duration: HIDE_DURATION,
        useNativeDriver: USE_NATIVE_DRIVER_IOS,
      }),
    ]).start(() => {
      setHidden(true);
      setVisible(false);
    });
  };

  const hide = () => {
    Animated.timing(height, {
      toValue: 0,
      duration: HIDE_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER_IOS,
    }).start(() => {
      setHidden(true);
    });
  };

  React.useLayoutEffect(() => {
    if (visible) {
      show();
    } else {
      hide();
    }
  }, [visible, height]);

  const animatedViewProps = {
    transform: [{ translateY: height }],
  };

  return (
    <View>
      <Button appearance="subtle" onClick={onButtonPress} style={styles.button}>
        {visible ? 'Hide' : 'Show'}
      </Button>
      {!hidden && (
        <Animated.View style={animatedViewProps}>
          <Notification
            variant={'primaryBar'}
            onPress={() => {
              console.log('Notification tapped');
            }}
          >
            Mail Sent
          </Notification>
        </Animated.View>
      )}
    </View>
  );
};

const notificationSections: TestSection[] = [
  {
    name: 'Custom Toast',
    component: CustomToast,
  },
  {
    name: 'Custom Bar',
    component: CustomBar,
  },
  {
    name: 'Primary with auto-hide',
    component: PrimaryWithAutoHide,
  },
  {
    name: 'Primary Bar with auto-hide',
    component: PrimaryBarWithAutoHide,
  },
];

export const NotificationTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Testing notification component';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Notification/SPEC.md';

  return <Test name="Notification Test" description={description} spec={spec} sections={notificationSections} status={status} />;
};
