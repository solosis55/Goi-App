module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/helpers/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|" +
      "expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|" +
      "react-navigation|@react-navigation/.*|@shopify/.*|" +
      "react-native-reanimated|react-native-gesture-handler)",
  ],
};
