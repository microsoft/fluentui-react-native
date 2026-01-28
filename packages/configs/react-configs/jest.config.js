module.exports = {
  // File patterns
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js|jsx)', '**/*.(test|spec).(ts|tsx|js|jsx)'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Module name mapping for non-JS assets
  moduleNameMapper: {
    // Handle static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },

  // Transform configuration using babel-jest
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      {
        configFile: '@fluentui-react-native/react-configs/babel.react.config.js',
      },
    ],
  },

  // Files to ignore during transformation
  // Allow ES modules in node_modules to be transformed
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],

  // Setup files (optional - packages can override this)
  setupFilesAfterEnv: [],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx,js,jsx}',
    '!src/**/index.{ts,tsx,js,jsx}',
    '!src/setupTests.{ts,js}',
  ],

  // Coverage thresholds (can be overridden)
  coverageThreshold: undefined,

  // Output configuration
  verbose: false,
  silent: false,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Handle ES modules properly with Yarn v4 PnP
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Module resolution for Yarn v4 PnP
  resolver: undefined,

  // Error handling
  errorOnDeprecated: false,

  // Test timeout
  testTimeout: 10000,
};
