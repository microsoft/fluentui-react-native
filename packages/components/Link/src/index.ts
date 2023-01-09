export { linkName as linkNameV1 } from './Link.types';
export type { LinkTokens, LinkProps, LinkAppearance, LinkState, LinkSlotProps, LinkType } from './Link.types';
export { defaultLinkTokens } from './LinkTokens';
export { linkStates, stylingSettings as linkStylingSettings } from './Link.styling';
export { useLink } from './useLink';
export { Link as LinkV1, linkLookup } from './Link';

export { linkName } from './legacy/Link.types';
export type {
  ILinkInfo,
  ILinkOptions,
  ILinkProps,
  ILinkRenderData,
  ILinkSlotProps,
  ILinkState,
  ILinkTokens,
  ILinkType,
  IWithLinkOptions,
} from './legacy/Link.types';
export { Link, useAsLink } from './legacy/Link';
export type { ILinkHooks } from './legacy/Link';
