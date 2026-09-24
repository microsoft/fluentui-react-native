import { processAliasTokens, transformWin32PlatformColorName, transformWindowsPlatformColorName } from '../processAliasTokens';

jest.mock('react-native', () => ({
  PlatformColor: (color: string) => `PlatformColor('${color}')`,
}));

const createAliasTokens = () => ({
  colors: {
    buttonFace: 'PlatformColor(ButtonFace)',
  },
});

it('maps Windows platform colors to SystemColor names', () => {
  expect(processAliasTokens(createAliasTokens(), transformWindowsPlatformColorName)).toEqual({
    colors: {
      buttonFace: "PlatformColor('SystemColorButtonFaceColor')",
    },
  });
});

it('preserves raw Win32 platform color names', () => {
  expect(processAliasTokens(createAliasTokens(), transformWin32PlatformColorName)).toEqual({
    colors: {
      buttonFace: "PlatformColor('ButtonFace')",
    },
  });
});
