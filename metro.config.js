const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Evita resolver una copia anidada/incompleta de expo-keep-awake bajo node_modules/expo.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "expo-keep-awake": path.resolve(__dirname, "node_modules/expo-keep-awake"),
};

// En dispositivo físico, REACT_NATIVE_PACKAGER_HOSTNAME debe ser la IP del PC (scripts/start-qr.ps1).
module.exports = config;
