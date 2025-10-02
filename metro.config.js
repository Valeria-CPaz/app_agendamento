const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  tslib: path.join(__dirname, 'node_modules', 'tslib', 'tslib.js'),
};

module.exports = config;
