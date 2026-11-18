const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required so Metro resolves the "react-native" / "browser" conditions in
// modern packages (notably the Firebase JS SDK) instead of only "main".
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
