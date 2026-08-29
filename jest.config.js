module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^expo-av$': '<rootDir>/src/tests/__mocks__/expo-av.js',
    '^expo-haptics$': '<rootDir>/src/tests/__mocks__/expo-haptics.js',
  },
};
