module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      // This is the part you need for the .env file
      plugins: [
        ["module:react-native-dotenv", {
          "moduleName": "@env",
          "path": ".env",
        }]
      ]
    };
  };