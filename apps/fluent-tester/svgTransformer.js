const { resolveConfig, transform } = require("@svgr/core");
const resolveConfigDir = require("path-dirname");

// Explicitly use the new React Native transformer
const upstreamTransformer = require("@react-native/metro-babel-transformer");

const defaultSVGRConfig = {
  native: true,
  plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            inlineStyles: {
              onlyMatchedOnce: false,
            },
            removeViewBox: false,
            removeUnknownsAndDefaults: false,
            convertColors: false,
          },
        },
      },
    ],
  },
};

module.exports.transform = async ({ src, filename, options }) => {
  if (filename.endsWith(".svg")) {
    const config = await resolveConfig(resolveConfigDir(filename));
    const svgrConfig = config
      ? { ...defaultSVGRConfig, ...config }
      : defaultSVGRConfig;

    const jsCode = await transform(src, svgrConfig, {
      filePath: filename,
    });

    return upstreamTransformer.transform({
      src: jsCode,
      filename,
      options,
    });
  }

  return upstreamTransformer.transform({ src, filename, options });
};
