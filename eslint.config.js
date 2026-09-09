const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // `._*` are AppleDouble sidecars macOS writes on filesystems without
    // xattr support (this repo lives on exFAT); they are not source files.
    ignores: ['dist/*', 'ios/*', 'android/*', 'node_modules/*', '.expo/*', '**/._*'],
  },
  {
    files: ['src/tests/**'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
]);
