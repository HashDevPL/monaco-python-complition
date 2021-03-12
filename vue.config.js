const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    plugins: [new MonacoWebpackPlugin()],
  },
};
