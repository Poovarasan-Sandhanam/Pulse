module.exports = {
  preset: 'jest-expo',
  // `._*` are AppleDouble sidecars macOS writes on filesystems without xattr
  // support (exFAT); Jest would otherwise try to run them as test files.
  testPathIgnorePatterns: ['/node_modules/', '/\\._'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^expo-av$': '<rootDir>/src/tests/__mocks__/expo-av.js',
    '^expo-haptics$': '<rootDir>/src/tests/__mocks__/expo-haptics.js',
    '^.*/modules/pulse-core$': '<rootDir>/src/tests/__mocks__/pulse-core.js',
  },
};
