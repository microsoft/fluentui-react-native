import * as React from 'react';
import { TurboModuleRegistry } from 'react-native';
import { AvatarProps } from './useAvatarImage.types';

interface PeoplePictureModule {
  getUriForPerson: (email: string) => Promise<string>;
}

const _stubNativeModule: PeoplePictureModule = {
  getUriForPerson: (_email) => {
    return Promise.reject(new Error('No PeoplePictureModule found in host'));
  },
};

const _nativeModuleAvatarImageProvider = {
  getPropsForConfig: (email = '') => {
    if (email === '') {
      return Promise.resolve({ imageUrl: '' });
    }
    const module = (TurboModuleRegistry.get('PeoplePictureModule') as PeoplePictureModule) || _stubNativeModule;
    return module.getUriForPerson(email).then(
      (uri: string) => {
        return { imageUrl: uri };
      },
      ({ message }) => {
        console.error(message);
        return { imageUrl: '' };
      },
    );
  },
};

// In the future, if desired, we could extend this such that we export a hook config a la Pressable...
//
// export type AvatarImageHookConfig = string | { ...otherParamsHere }
//
// ...and extend the hook to allow people to inject their own ImageProviders...
//
// useAvatarImage = (config: AvatarImageHookConfig, provider: AvatarImageProvider = _nativeModuleAvatarImageProvider)
//
// ...so the same hook could be used with another JS-based picture fetching service or a native module with a different
// signature. The idea being the config is the params to the service, the provider exposes the promise to fetch the
// URI, and we can generalize any (NYI) hook state/caching benefits in the hook.
//
// Returns an Partial<AvatarProps> in case future iterations of Avatar have different image-related props that a
// provider prefers.
export const useAvatarImage = (email: string): Partial<AvatarProps> => {
  const [avatarProps, setAvatarProps] = React.useState<Partial<AvatarProps>>();
  React.useEffect(() => {
    _nativeModuleAvatarImageProvider.getPropsForConfig(email).then((props) => {
      setAvatarProps(props);
    });
  }, [email]);
  return avatarProps;
};
