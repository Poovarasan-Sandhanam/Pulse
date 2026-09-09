const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// `._*` are AppleDouble sidecars macOS writes on filesystems without xattr
// support (this repo lives on exFAT). Metro would otherwise try to parse them
// as source and fail with "Unexpected character".
config.resolver.blockList = [/(^|[\\/])\._[^\\/]*$/];

module.exports = config;
