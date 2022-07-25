import * as React from 'react';
import { Notification, NotificationVariant, NotificationVariants } from '@fluentui-react-native/notification';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Animated, Easing, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { StyledPicker } from '../Common/StyledPicker';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import PlayButton from './assets/play_button.svg';

const svgProps: SvgIconProps = {
  src: PlayButton,
};
const iconProps = { svgSource: svgProps };

const SHOW_HEIGHT = -50;
const NOTIFICATION_SHOW_DURATION = 600;
const BAR_SHOW_DURATION = 300;
const HIDE_DURATION = 250;
const AUTO_HIDE_DURATION = 3000;
const NOTIFICATION_BOUNCINESS = 1.5;
const USE_NATIVE_DRIVER_IOS = true;

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    marginBottom: 100,
  },
  notification: {
    marginTop: 70,
  },
  textInput: {
    borderWidth: 1,
  },
});

const CustomToast: React.FunctionComponent = () => {
  const [variant, setVariant] = React.useState<NotificationVariant>('primary');
  const onVariantChange = React.useCallback((value) => setVariant(value), []);

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
        onChange={onVariantChange}
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
  const onVariantChange = React.useCallback((value) => setVariant(value), []);

  const [message, setMessage] = React.useState('Updating...');

  return (
    <View>
      <StyledPicker
        prompt="Variant"
        selected={variant}
        onChange={onVariantChange}
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
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  const show = () => {
    setHidden(false);
    Animated.sequence([
      Animated.timing(height, {
        toValue: SHOW_HEIGHT,
        duration: NOTIFICATION_SHOW_DURATION,
        useNativeDriver: USE_NATIVE_DRIVER_IOS,
        easing: Easing.elastic(NOTIFICATION_BOUNCINESS),
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
        <Animated.View style={[animatedViewProps]}>
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
  const [visible, setVisible] = React.useState(false);
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
        <Animated.View style={[animatedViewProps]}>
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
    name: 'Custom Toast Notification',
    component: CustomToast,
  },
  {
    name: 'Custom Bar Notification',
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
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Testing notification component';

  return <Test name="Notification Test" description={description} sections={notificationSections} status={status}></Test>;
};
