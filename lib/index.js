'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function WebpackModuleList(options) {
  this.options = options;
}

WebpackModuleList.prototype.apply = function (compiler) {
  var _this = this;

  compiler.plugin('emit', function (compilation, callback) {
    var json = {};
    compilation.chunks.forEach(function (chunk) {
      chunk.files.forEach(function (filename) {
        var ref = json[chunk.name];
        if (ref === undefined) {
          ref = {};
          json[chunk.name] = ref;
        }

        if (filename.endsWith('js')) {
          ref.source = filename;
        } else if (filename.endsWith('map')) {
          ref.map = filename;
        }
      });
    });

    // Write out JSON
    var destination = _path2.default.join(_this.options.path, _this.options.filename);
    var blob = JSON.stringify(json);

    _fs2.default.open(destination, 'w', function (openErr, fd) {
      if (openErr) {
        console.error('Failed to open file \'' + destination + '\' with error \'' + openErr.toString() + '\'; quitting.');
        callback();
        return;
      }

      _fs2.default.write(fd, blob, function (writeErr, written, buffer) {
        if (writeErr) {
          console.error('Failed to write file \'' + destination + '\' with error \'' + writeErr.toString() + '\'; quitting.');
          callback();
          return;
        }

        _fs2.default.close(fd, function (closeErr) {
          if (closeErr) {
            console.warn('Failed to close file \'' + destination + '\' with error \'' + closeErr.toString() + '\'.');
          }

          callback();
        });
      });
    });
  });
};

module.exports = WebpackModuleList;