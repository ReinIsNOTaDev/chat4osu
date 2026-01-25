module.exports = {
  target: 'electron-renderer',
  externals: {
    'electron': 'commonjs electron'
  }
};