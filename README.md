# webpack_module_list
A WebPack2 plugin to emit a JSON file with a map of chunk names and files.

[![Build Status](https://travis-ci.org/object88/webpack-file-list-plugin.svg?branch=master)](https://travis-ci.org/object88/webpack-file-list-plugin)

When using Webpack's [Common Chunk Plugin](https://webpack.js.org/plugins/commons-chunk-plugin/), your chunk files can be given a hash string in the name to differentiate the build.  Example webpack output:

```
Asset                                    Size  Chunks                    Chunk Names
vendor.5a33f3d38bc21ce08e49.js         689 kB    0, 2  [emitted]  [big]  vendor
app.36607625cfc7b0dd814c.js           7.29 kB    1, 2  [emitted]         app
manifest.29ede0603cd2ee1c98f0.js      1.49 kB       2  [emitted]         manifest
vendor.5a33f3d38bc21ce08e49.js.map    5.29 MB    0, 2  [emitted]         vendor
app.36607625cfc7b0dd814c.js.map         34 kB    1, 2  [emitted]         app
manifest.29ede0603cd2ee1c98f0.js.map  14.1 kB       2  [emitted]         manifest
```

This plugin will generate a JSON file with the chunks & file names, so that a web server can serve the exact file without relying on pattern matching or other clumsy methods.

Example output:
``` JSON
{
  "vendor": {
    "source": "vendor.5a33f3d38bc21ce08e49.js",
    "map": "vendor.5a33f3d38bc21ce08e49.js.map"
  },
  "app": {
    "source": "app.36607625cfc7b0dd814c.js",
    "map": "app.36607625cfc7b0dd814c.js.map"
  },
  "manifest": {
    "source": "manifest.29ede0603cd2ee1c98f0.js",
    "map": "manifest.29ede0603cd2ee1c98f0.js.map"
  }
}
```

Example usage in `webpack.conf.js`:

``` js
module.exports = {
  entry: {
    app: path.resolve(__dirname, 'js', 'app.js'),
  },
  // ...
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
         return module.context && module.context.indexOf('node_modules') !== -1;
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity,
    }),
    new WebpackFileList({
      filename: 'foo.json',
      path: path.resolve(__dirname, 'bin'),
    }),
  ],
}
```
