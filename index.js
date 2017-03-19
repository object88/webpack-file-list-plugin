function WebpackModuleList() {}

WebpackModuleList.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    compilation.chunks.forEach(function(chunk) {
      
    });

    callback();
  });
};

module.exports = WebpackModuleList;
