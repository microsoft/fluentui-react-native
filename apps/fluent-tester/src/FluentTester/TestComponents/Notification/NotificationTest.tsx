import * as React from 'react';
import { Notification } from '@fluentui-react-native/notification';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Animated, Button, Easing, Switch, TextInput, View } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { StyledPicker } from '../Common/StyledPicker';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { NotificationVariant, NotificationVariants } from '../../../../../../packages/components/Notification/src/Notification.types';
import { SvgIconProps } from '@fluentui-react-native/icon';
import PlayButton from './assets/play_button.svg';

const svgProps: SvgIconProps = {
  src: PlayButton,
};
const iconProps = { svgSource: svgProps };

const toastShowDuration = 600;
const barShowDuration = 300;
const hideDuration = 250;
const toastBounciness = 1.5;
const useNativeDriverIOS = true;

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
        collection={NotificationVariants.filter((variant) => variant.length < 10)}
      />
      <TextInput value={title} onChangeText={setTitle} style={{ borderWidth: 1 }} />
      <TextInput value={message} onChangeText={setMessage} style={{ borderWidth: 1 }} />
      <TextInput value={action} onChangeText={setAction} style={{ borderWidth: 1 }} />
      <View style={commonStyles.switch}>
        <Text>Show icon </Text>
        <Switch value={showIcon} onValueChange={setShowIcon} />
      </View>
      <View style={commonStyles.switch}>
        <Text>Show title </Text>
        <Switch value={showTitle} onValueChange={setShowTitle} />
      </View>
      <View style={{ marginTop: 70 }}>
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
        collection={NotificationVariants.filter((variant) => variant.length > 9)}
      />
      <TextInput value={message} onChangeText={setMessage} style={{ borderWidth: 1 }} />
      <View style={{ marginTop: 60 }}>
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
        toValue: -50,
        duration: toastShowDuration,
        useNativeDriver: useNativeDriverIOS,
        easing: Easing.elastic(toastBounciness),
      }),
      Animated.delay(3000),
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }),
    ]).start(() => {
      setHidden(true);
      setVisible(false);
    });
  };

  const hide = () => {
    Animated.timing(height, {
      toValue: 0,
      duration: hideDuration,
      useNativeDriver: useNativeDriverIOS,
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
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
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
        toValue: -50,
        duration: barShowDuration,
        useNativeDriver: useNativeDriverIOS,
      }),
      Animated.delay(3000),
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }),
    ]).start(() => {
      setHidden(true);
      setVisible(false);
    });
  };

  const hide = () => {
    Animated.timing(height, {
      toValue: 0,
      duration: hideDuration,
      useNativeDriver: useNativeDriverIOS,
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
      <View style={{ marginBottom: 100 }}>
        <Button onPress={onButtonPress} title={visible ? 'Hide' : 'Show'} />
      </View>
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
