import { PersonaSize, PersonaCoinColor, PersonaPresence, IPersonaCoinTokens } from './PersonaCoin.types';
import { ImageURISource } from 'react-native';

const presenceIconCache: { [key in PersonaPresence]: ImageURISource } = {
  none: { uri: '' },
  offline: {
    uri:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAACoxM+oxM+oxM+oxM+oxM+oxM+oxM+oxM////+oxM/W5OmzzNX5+/z3+vvu9Pbt8/Xj7PAAKKEtAAAACXRSTlMA6bWcZQpiXgXWfJCWAAAAeElEQVQoz52RSQ7EIAwEx0AWymT7/2dHYpgoPvQldeySsGl/XjOVZGCpTDFfjIEtj3jN0Pzc99Mb5PUWGbwOHPI/n+GqNxfMY67h9YFjvw0KrQYapYuER+GkLowjigPrArYoNpBCPiWHy3XlB1UlqkRZuziUPO1bvszLC8V87ko/AAAAAElFTkSuQmCC'
  },
  online: {
    uri:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAWlBMVEUAAABusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAX////N4bi61517tivn8d3e7NL3+vTE3Kux0o6nzH6GvEWFZ26xAAAAEnRSTlMA8eNrEQj6syHTeXrKshzZ19JHa6QpAAAApUlEQVQoz4WS6w7CIAyFBwwGbE5th87b+7+mCDXcIp4/NN9J2tJ2+KdRTFyx0yTGAkvLgMRmmbg2kMnoL185FOIr5Vmg0hKzWWhkQz+sNdinN1Eg9wyP8MYh5xvewjt5gxcct9iYN1SIXvsj46C8EWvfEZ0jTsYxRJcrYuLAqTg5xKm4AHL2xEH8/GBvJIM819xIWkc9dt1ZFEnO+WrbY1CcjqGnN0xiGcyuKFtcAAAAAElFTkSuQmCC'
  },
  away: {
    uri:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAP1BMVEUAAAD6yRT6yRT6yRT6yRT6yRT6yRT6yRT6yRT6yRT6yRT6yRT////6zCP95pH95Yv++OL84Hn822T72FT71EUen9LHAAAAC3RSTlMA6rVlCuWgmGJeBd4LCPMAAAB8SURBVCjPnZFLDoAgDERtQUUH/97/rCYNJUITTXjLeYu2064Z75gAYufLfOqR6KdXPI94Mc5ZDCgYNA8piHGBENJcqgV5EQ61gBPBVrAIsoJEwArUYi0EIbFlQ+VwHGpY11XOGDdZVw/MXPstB2olFeGnRFv796Psa1t5ANwFDZEW8B8sAAAAAElFTkSuQmCC'
  },
  dnd: {
    uri:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAQlBMVEUAAADpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABv////wfYT86errJjiR9OLxAAAAEXRSTlMA4/CzeQj602seEhEk89jKakfnNfsAAACKSURBVCjPhZFbDoQgDEWBQkHBR2d0/1udEppR0cbzeU9SSq95I69gcZphzZc4eEeC8+HIh0gn4vDPLV2wYsJCHUub5umGr/no7sKNLBI9kFjAkwAWbaX9K+xtMRZIle0jbFRBFpMmZmWU8ri+rv5B/SQmxD6PUknpz16MUJSi9GqZnMAiWkjZvPADxcoYalVfnOMAAAAASUVORK5CYII='
  },
  blocked: {
    uri:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAe1BMVEUAAADpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABv////pABv83uHqCiTsJz7rGjP7zNHvRVj/+vv+8vP6x83sIzv2mqXsKD/7zNL5v8b3oqz2maTuP1P82Nz819vtKUDrGjLrGTK2dyGvAAAAEXRSTlMA8dSzeQj64mseEhHkJMpq5T3coEAAAADSSURBVCjPhdHZFoIgFAVQGQRLGzhQiaLNw/9/YZRk4IvncZ+17uJys7mUGyYFoWxTJpxzghDC878vKFBftLX6UgN0MXqF/qRCTg5VaPI1ro36Re+MWQ/TOPrEXw7840uCNvb9oQVZ+qJAnbpSNQpfMHQTVx2YLyT0xJWG9IWAnbiyEL4gaCKPCopb7P9RDOeJqzNYeG7i3+eGBVMPC2Yczpn9cfTmAT58IoV5Rn4FDSdZbY1rxzk9qpXHofkcqtO2uXfhUHOn9SkLJoWQrCizmbwBa5IbuX8ugpIAAAAASUVORK5CYII='
  },
  busy: {
    uri:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAADpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvsgIdoAAAAEXRSTlMA8eLUEQj6s2sheXrlyrJqHBqb3nMAAAB/SURBVCjPhZFRDsQgCEQFEdS223L/yy7JummtGN/nvASUCSvoFGSIclIXpwragC3deYn6IJZ/fqF24NXmHPri+E2rOlCDQTAKIBNZHbKJjyfEBHoCTbAn2ATMRPRHzZfPn+t/cH4SIw3rY2p17H2+l0VRRtr8ag3KgswomcKCL1NmGBp9lqsZAAAAAElFTkSuQmCC'
  }
};

export function getPresenceIconSource(presence: PersonaPresence): ImageURISource {
  return presenceIconCache[presence];
}

export type PersonaSizeConfig = {
  physicalSize: number;
  iconSize: number;
  initialsSize: number;
};

const sizeTable: { [P in PersonaSize]: PersonaSizeConfig } = {
  size8: { physicalSize: 8, iconSize: 0, initialsSize: 4 },
  size24: { physicalSize: 24, iconSize: 8, initialsSize: 10 },
  size32: { physicalSize: 32, iconSize: 8, initialsSize: 12 },
  size40: { physicalSize: 40, iconSize: 12, initialsSize: 14 },
  size48: { physicalSize: 48, iconSize: 12, initialsSize: 16 },
  size56: { physicalSize: 56, iconSize: 16, initialsSize: 18 },
  size72: { physicalSize: 72, iconSize: 20, initialsSize: 20 },
  size100: { physicalSize: 100, iconSize: 28, initialsSize: 36 },
  size120: { physicalSize: 120, iconSize: 32, initialsSize: 40 }
};

export function getSizeConfig(size: PersonaSize): PersonaSizeConfig {
  return sizeTable[size];
}

const colorTable: { [P in PersonaCoinColor]: string } = {
  lightBlue: '#4F6BED',
  blue: '#0078D4',
  darkBlue: '#004E8C',
  teal: '#038387',
  green: '#498205',
  darkGreen: '#0B6A0B',
  lightPink: '#C239B3',
  pink: '#E3008C',
  magenta: '#881798',
  purple: '#5C2E91',
  orange: '#CA5010',
  lightRed: '#D13438',
  darkRed: '#A4262C',
  violet: '#8764B8',
  gold: '#986F0B',
  burgundy: '#750B1C',
  warmGray: '#7A7574',
  cyan: '#005B70',
  rust: '#8E562E',
  coolGray: '#69797E'
};

export function convertCoinColor(coinColor: PersonaCoinColor): string {
  return colorTable[coinColor];
}

export function calculateEffectiveSizes(tokens: IPersonaCoinTokens): PersonaSizeConfig {
  const { size, coinSize, iconSize, initialsSize } = tokens;

  if (size) {
    return sizeTable[size];
  } else {
    const { physicalSize: defaultPhysicalSize, iconSize: defaultIconSize, initialsSize: defaultInitialsSize } = sizeTable['size40'];

    return {
      physicalSize: coinSize || defaultPhysicalSize,
      iconSize: iconSize || defaultIconSize,
      initialsSize: initialsSize || defaultInitialsSize
    };
  }
}
