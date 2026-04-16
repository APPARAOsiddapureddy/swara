module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Metro web serves a classic script, not type="module", so bare `import.meta` must be transformed.
          web: {
            unstable_transformImportMeta: true,
          },
        },
      ],
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
