const lodashCloneDeep = require("lodash/cloneDeep");
// const path = require("path");
// const ManifestPlugin = require("webpack-manifest-plugin");
// const paths = require("./paths");
const CopyPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");


module.exports = function override(defaultConfig, env) {
  const overridenConfig = lodashCloneDeep(defaultConfig);
  /*
  // entry
  const originalEntry = overridenConfig.entry;
  const overridenEntry = {
    app: originalEntry,
    extensionWorker: path.resolve(
      __dirname,
      "src/UI/utils/extension-worker.ts"
    ),
  };
  overridenConfig.entry = overridenEntry;

  // output.filename
  const originalOutputFilename = overridenConfig.output.filename;
  const overridenOutputFilename = (chunkData) => {
    return chunkData.chunk.name === "runtime-app"
      ? originalOutputFilename
      : "static/js/extension.worker.bundle.js";
  };
  overridenConfig.output.filename = overridenOutputFilename;

  // plugins
  const originalPlugins = overridenConfig.plugins;
  const manifestPluginIndex = originalPlugins.findIndex((instance) =>instance.constructor.name === 'ManifestPlugin');
  const overridenManifestPlugin = new ManifestPlugin({
    fileName: "asset-manifest.json",
    publicPath: paths.publicPath,
    generate: (seed, files, entrypoints) => {
      const manifestFiles = files.reduce((manifest, file) => {
        manifest[file.name] = file.path;
        return manifest;
      }, seed);
      const entrypointFilesForApp = entrypoints.app.filter(
        (fileName) => !fileName.endsWith(".map")
      );
      const entrypointFilesForExtensionWorker = entrypoints.extensionWorker.filter(
        (fileName) => !fileName.endsWith(".map")
      );

      return {
        files: manifestFiles,
        entrypointsForApp: entrypointFilesForApp,
        entrypointsForExtensionWorker: entrypointFilesForExtensionWorker,
      };
    },
  });
  originalPlugins[manifestPluginIndex] = overridenManifestPlugin;
  */
  // caching
  overridenConfig.module.rules[1].oneOf[2].options.cacheDirectory = false;

  // module
  overridenConfig.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: "src/UI/utils/extension-worker.js",
          to: "static/js/[name].bundle.[ext]",
        },
      ],
    }),
    new WriteFilePlugin({
      test: /extension-worker\.js/,
    })
  );

  return overridenConfig;
};
