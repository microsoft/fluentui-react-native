import React, { FunctionComponent } from 'react';
import { Avatar } from '@fluentui-react-native/avatar';
import { View } from 'react-native';
import { steveBallmerPhotoUrl } from './../PersonaCoin/styles';
import { mobileStyles } from '../Common/styles';
import { Switch } from '@fluentui-react-native/switch';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

export const StandardUsage: FunctionComponent = () => {
  const [activityRing, setActivityRing] = React.useState(true);

  const toggleActivityState = (_e: InteractionEvent, isActive: boolean) => {
    setActivityRing(isActive);
  };

  return (
    <View style={mobileStyles.pageStyle}>
      <Switch label={'Show Activity Ring'} defaultChecked={true} onChange={toggleActivityState} />

      <View style={mobileStyles.testVariants}>
        {/* Variation  - Initials. */}
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={16} name="Rafi" avatarColor={'colorful'} />
        <Avatar
          active={activityRing ? 'active' : 'inactive'}
          activeAppearance="ring"
          size={20}
          name="Richard Faynman"
          avatarColor={'colorful'}
        />
        <Avatar
          active={activityRing ? 'active' : 'inactive'}
          activeAppearance="ring"
          size={24}
          name="Gita Khawas"
          avatarColor={'colorful'}
        />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={32} name="Mary Kom" avatarColor={'colorful'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={40} name="Khan Sir" avatarColor={'colorful'} />
        <Avatar
          active={activityRing ? 'active' : 'inactive'}
          activeAppearance="ring"
          size={56}
          name="Harry Potter"
          avatarColor={'colorful'}
        />
        <Avatar
          active={activityRing ? 'active' : 'inactive'}
          activeAppearance="ring"
          size={72}
          name="Ellie armstrong"
          avatarColor={'colorful'}
        />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Image */}
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={16} imageUrl={steveBallmerPhotoUrl} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={20} imageUrl={steveBallmerPhotoUrl} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={24} imageUrl={steveBallmerPhotoUrl} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={32} imageUrl={steveBallmerPhotoUrl} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={40} imageUrl={steveBallmerPhotoUrl} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={56} imageUrl={steveBallmerPhotoUrl} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={72} imageUrl={steveBallmerPhotoUrl} />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Standard */}

        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={16} avatarColor={'brand'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={20} avatarColor={'brand'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={24} avatarColor={'brand'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={32} avatarColor={'brand'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={40} avatarColor={'brand'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={56} avatarColor={'brand'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={72} avatarColor={'brand'} />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Standard Inverted */}
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={16} avatarColor={'brandInverted'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={20} avatarColor={'brandInverted'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={24} avatarColor={'brandInverted'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={32} avatarColor={'brandInverted'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={40} avatarColor={'brandInverted'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={56} avatarColor={'brandInverted'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={72} avatarColor={'brandInverted'} />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Anonymous */}
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={16} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={20} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={24} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={32} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={40} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={56} />
        <Avatar
          accessibilityLabel="Fall-back Icon"
          accessibilityHint="A picture representing a user"
          size={72}
          activeAppearance="ring"
          active={activityRing ? 'active' : 'inactive'}
        />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Anonymous accent */}
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={16} avatarColor={'accent'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={20} avatarColor={'accent'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={24} avatarColor={'accent'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={32} avatarColor={'accent'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={40} avatarColor={'accent'} />
        <Avatar active={activityRing ? 'active' : 'inactive'} activeAppearance="ring" size={56} avatarColor={'accent'} />
        <Avatar
          accessibilityLabel="Fall-back Icon"
          accessibilityHint="A picture representing a user"
          size={72}
          activeAppearance="ring"
          active={activityRing ? 'active' : 'inactive'}
          avatarColor={'accent'}
        />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Overflow .*/}

        <Avatar shape={'square'} size={16} name="Rafi" avatarColor={'colorful'} />
        <Avatar shape={'square'} size={20} name="Richard Faynman" avatarColor={'colorful'} />
        <Avatar shape={'square'} size={24} name="Gita Khawas" avatarColor={'colorful'} />
        <Avatar shape={'square'} size={32} name="Mary Kom" avatarColor={'colorful'} />
        <Avatar shape={'square'} size={40} name="Khan Sir" avatarColor={'colorful'} imageUrl={steveBallmerPhotoUrl} />
        <Avatar shape={'square'} size={56} name="Harry Potter" avatarColor={'colorful'} />
        <Avatar shape={'square'} size={72} name="Ellie armstrong" avatarColor={'colorful'} />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Overflow .*/}
        <Avatar size={16} initials="20" />
        <Avatar size={20} initials="11" />
        <Avatar size={24} initials="88" />
        <Avatar size={32} initials="20" />
        <Avatar size={40} initials="20" />
        <Avatar size={56} initials="56" />
        <Avatar size={72} initials="20" />
      </View>
    </View>
  );
};
