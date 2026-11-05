import { getCurrentAppearance } from '../../theming';

const fallBackAppearance = 'light';

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
    getColorScheme: () => 'dark',
  }));
});

describe('getCurrentAppearanceTable test', () => {
  it('light', () => {
    expect(getCurrentAppearance('light', fallBackAppearance)).toBe('light');
  });

  it('dark', () => {
    expect(getCurrentAppearance('dark', fallBackAppearance)).toBe('dark');
  });

  it('highContrast', () => {
    expect(getCurrentAppearance('highContrast', fallBackAppearance)).toBe('highContrast');
  });

  it('dynamic', () => {
    expect(getCurrentAppearance('dynamic', fallBackAppearance)).toBe('dark');
  });

  it('undefined', () => {
    expect(getCurrentAppearance(undefined, fallBackAppearance)).toBe(fallBackAppearance);
  });
});
