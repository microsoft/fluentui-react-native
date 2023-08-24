if (__DEV__) {
  console.warn(
    'The @fluentui-react-native/exprimental-link package is deprecated. The contents of this package have been moved to @fluentui-react-native/link. If you need to use the Link component from this package, please use LinkV1 from @fluentui-react-native/link.',
  );
}

export type { LinkTokens, LinkProps, LinkAppearance, LinkState, LinkSlotProps, LinkType } from '@fluentui-react-native/link';
export {
  linkNameV1 as linkName,
  defaultLinkTokens,
  linkStates,
  linkStylingSettings,
  useLink,
  LinkV1 as Link,
  linkLookup,
} from '@fluentui-react-native/link';
