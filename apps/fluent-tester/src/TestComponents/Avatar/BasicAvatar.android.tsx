import React, { FunctionComponent } from 'react';
import { Avatar } from '@fluentui-react-native/avatar';
import { View } from 'react-native';
import { steveBallmerPhotoUrl } from './../PersonaCoin/styles';
import { mobileStyles } from '../Common/styles';

export const StandardUsage: FunctionComponent = () => {
  return (
    <View style={{ paddingBottom: 40 }}>
      <View style={mobileStyles.testVariants}>
        {/* Variation - Standard */}

        {/* With badge. */}
        <Avatar badge={{ status: 'available' }} avatarColor={'brand'} size={40} />

        {/* Variation - No Ring and badge. */}
        <Avatar size={56} avatarColor={'brand'} />

        {/* Variation - With Ring.*/}
        <Avatar active="active" activeAppearance="ring" size={56} avatarColor={'brand'} />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Standard Inverted */}

        {/* With badge only.*/}
        <Avatar size={56} badge={{ status: 'available' }} avatarColor={'brandInverted'} />

        {/* No ring and badge.*/}
        <Avatar size={56} avatarColor={'brandInverted'} />

        {/* With ring.*/}
        <Avatar active="active" activeAppearance="ring" size={56} avatarColor={'brandInverted'} />
      </View>

      <View style={mobileStyles.testVariants}>
        {/*Variation - Anonymous*/}

        {/* With Badge.*/}
        <Avatar size={56} badge={{ status: 'available' }} />

        {/* No ring and badge.*/}
        <Avatar accessibilityLabel="Fall-back Icon" accessibilityHint="A picture representing a user" size={56} />

        {/* With ring. */}
        <Avatar
          accessibilityLabel="Fall-back Icon"
          accessibilityHint="A picture representing a user"
          size={56}
          activeAppearance="ring"
          active="active"
        />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Anonymous accent.*/}

        {/* With badge.*/}
        <Avatar size={56} badge={{ status: 'available' }} avatarColor={'accent'} />

        {/* No ring and badge.*/}
        <Avatar accessibilityLabel="Fall-back Icon" accessibilityHint="A picture representing a user" size={56} avatarColor={'accent'} />

        {/* With ring. */}
        <Avatar
          accessibilityLabel="Fall-back Icon"
          accessibilityHint="A picture representing a user"
          size={56}
          activeAppearance="ring"
          active="active"
          avatarColor={'accent'}
        />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Initials.*/}

        {/* With badge.*/}
        <Avatar size={56} badge={{ status: 'outOfOffice' }} name="* Richard Faynman *" />

        {/* No ring and badge.*/}
        <Avatar size={56} name="* Annie Markus *" avatarColor={'colorful'} />

        {/* With ring. */}
        <Avatar active="active" activeAppearance="ring" size={56} name="* Keshav Madhav *" avatarColor={'colorful'} />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Image. */}

        {/* With badge.*/}
        <Avatar size={56} badge={{ status: 'outOfOffice' }} name="* Richard Faynman *" imageUrl={steveBallmerPhotoUrl} />

        {/* No ring and badge.*/}
        <Avatar size={56} imageUrl={steveBallmerPhotoUrl} avatarColor={'colorful'} />

        {/* With ring.*/}
        <Avatar active="active" activeAppearance="ring" size={56} name="* Richard Faynman *" imageUrl={steveBallmerPhotoUrl} />
      </View>

      <View style={mobileStyles.testVariants}>
        {/* Variation - Overflow .*/}

        <Avatar size={56} initials="20" avatarColor={'colorful'} />

        {/* Variation - Group avatar*/}

        <Avatar size={56} shape={'square'} avatarColor={'colorful'} name="*Annie Martha*" />
      </View>
    </View>
  );
};
