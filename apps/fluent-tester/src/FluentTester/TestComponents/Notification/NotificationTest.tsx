import * as React from 'react';
import { Notification } from '@fluentui-react-native/notification';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Animated, Button, Easing, View } from 'react-native';
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

const PrimaryTestWithAutoHide: React.FunctionComponent = () => {
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

const PrimaryTestWithTitleAndIcon: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  React.useLayoutEffect(() => {
    if (visible) {
      setHidden(false);
      Animated.timing(height, {
        toValue: -50,
        duration: toastShowDuration,
        useNativeDriver: useNativeDriverIOS,
        easing: Easing.elastic(toastBounciness),
      }).start();
    } else {
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start(() => {
        setHidden(true);
      });
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
            icon={iconProps}
            title="Kat's iPhoneX"
            onPress={() => {
              console.log('Notification tapped');
            }}
          >
            Listen to Emails • 7 mins
          </Notification>
        </Animated.View>
      )}
    </View>
  );
};

const NeutralTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  React.useLayoutEffect(() => {
    if (visible) {
      setHidden(false);
      Animated.timing(height, {
        toValue: -50,
        duration: toastShowDuration,
        useNativeDriver: useNativeDriverIOS,
        easing: Easing.elastic(toastBounciness),
      }).start();
    } else {
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start(() => {
        setHidden(true);
      });
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
            variant={'neutral'}
            action="Sign in"
            onPress={() => {
              console.log('Notification tapped');
            }}
            onActionPress={() => {
              console.log('Sign in tapped');
            }}
          >
            Some items require you to sign in to view them
          </Notification>
        </Animated.View>
      )}
    </View>
  );
};

const DangerTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  React.useLayoutEffect(() => {
    if (visible) {
      setHidden(false);
      Animated.timing(height, {
        toValue: -50,
        duration: toastShowDuration,
        useNativeDriver: useNativeDriverIOS,
        easing: Easing.elastic(toastBounciness),
      }).start();
    } else {
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start(() => {
        setHidden(true);
      });
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
            variant={'danger'}
            action="Retry"
            onPress={() => {
              console.log('Notification tapped');
            }}
            onActionPress={() => {
              console.log('Retry tapped');
            }}
          >
            There was a problem, and your recent changes may not have saved
          </Notification>
        </Animated.View>
      )}
    </View>
  );
};

const WarningTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  React.useLayoutEffect(() => {
    if (visible) {
      setHidden(false);
      Animated.timing(height, {
        toValue: -50,
        duration: toastShowDuration,
        useNativeDriver: useNativeDriverIOS,
        easing: Easing.elastic(toastBounciness),
      }).start();
    } else {
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start(() => {
        setHidden(true);
      });
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
            variant={'warning'}
            onPress={() => {
              console.log('Notification tapped');
            }}
          >
            Read Only
          </Notification>
        </Animated.View>
      )}
    </View>
  );
};

const PrimaryBarTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  React.useLayoutEffect(() => {
    if (visible) {
      setHidden(false);
      Animated.timing(height, {
        toValue: -50,
        duration: barShowDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start();
    } else {
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start(() => {
        setHidden(true);
      });
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
            Updating...
          </Notification>
        </Animated.View>
      )}
    </View>
  );
};

const PrimaryOutlineBarTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  React.useLayoutEffect(() => {
    if (visible) {
      setHidden(false);
      Animated.timing(height, {
        toValue: -50,
        duration: barShowDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start();
    } else {
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start(() => {
        setHidden(true);
      });
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
            variant={'primaryOutlineBar'}
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

const NeutralBarTest: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(false);
  const onButtonPress = () => setVisible(!visible);

  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const height = React.useRef(new Animated.Value(0)).current;

  React.useLayoutEffect(() => {
    if (visible) {
      setHidden(false);
      Animated.timing(height, {
        toValue: -50,
        duration: barShowDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start();
    } else {
      Animated.timing(height, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: useNativeDriverIOS,
      }).start(() => {
        setHidden(true);
      });
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
            variant={'neutralBar'}
            onPress={() => {
              console.log('Notification tapped');
            }}
          >
            No internet connection
          </Notification>
        </Animated.View>
      )}
    </View>
  );
};

const notificationSections: TestSection[] = [
  {
    name: 'Primary with auto-hide',
    component: PrimaryTestWithAutoHide,
  },
  {
    name: 'Primary with Title and Icon',
    component: PrimaryTestWithTitleAndIcon,
  },
  {
    name: 'Neutral',
    component: NeutralTest,
  },
  {
    name: 'Danger',
    component: DangerTest,
  },
  {
    name: 'Warning',
    component: WarningTest,
  },
  {
    name: 'Primary Bar',
    component: PrimaryBarTest,
  },
  {
    name: 'Primary Outline Bar',
    component: PrimaryOutlineBarTest,
  },
  {
    name: 'Neutral Bar',
    component: NeutralBarTest,
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
