// @flow
import fs from 'fs';
import path from 'path';

type Options = {
  filename: string,
  includeMap?: boolean,
  path: string,
  priorities?: Array<string>,
};

type Result = {
  [key: string]: ResultEntry,
};

type ResultEntry = {
  css?: string,
  cssMap?: string,
  priority?: number,
  source: string,
  sourceMap?: string,
};

/**
 * New webpack 4 API,
 * for webpack 2-3 compatibility used .plugin('...', cb)
 */
function unCamelCase(str): string {
    return str.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
}

function pluginCompatibility(caller, hook, cb) {
    if (caller.hooks) {
        caller.hooks[hook].tap('webpack-file-list-plugin', cb);
    } else {
        caller.plugin(unCamelCase(hook), cb);
    }
}

function WebpackFileList(options: Options) {
  if (!options.filename) {
    throw new Error("filename property is required on options");
  } else if (!options.path) {
    throw new Error("path property is required on options");
  }

  this.options = options;
}

WebpackFileList.prototype.applyPriorities = function(result: Result) {
  if (!this.options.priorities) {
    return;
  }

  let priorityCount = 0;
  this.options.priorities.forEach((p) => {
    const resultEntry = result[p];
    if (!resultEntry) {
      return;
    }

    resultEntry.priority = priorityCount;
    priorityCount++;
  });
};

WebpackFileList.prototype.apply = function(compiler) {
  pluginCompatibility(compiler, 'emit', (compilation, callback) => {
    const json: Result = {};
    compilation.chunks.forEach((chunk) => {
      chunk.files.forEach((filename) => {
        let ref = json[chunk.name];
        if (ref === undefined) {
          ref = {};
          json[chunk.name] = ref;
        }

        if (filename.endsWith('css')) {
          ref.css = filename;
        } else if (filename.endsWith('css.map') && this.options.includeMap) {
          ref.cssMap = filename;
        } else if (filename.endsWith('js')) {
          ref.source = filename;
        } else if (filename.endsWith('js.map') && this.options.includeMap) {
          ref.sourceMap = filename;
        }
      });
    });

    // Apply priorities
    this.applyPriorities(json);

    // Write out JSON
    const destination = path.join(this.options.path, this.options.filename);
    const blob = JSON.stringify(json, undefined, 2);
    const buffer = new Buffer(blob);

    const mode = 0x1a4;
    fs.open(destination, 'w', mode, (openErr, fd) => {
      if (openErr) {
        console.error(`Failed to open file '${destination}' with error '${openErr.toString()}'; quitting.`);
        callback();
        return;
      }

      fs.write(fd, buffer, 0, buffer.length, 0, (writeErr) => {
        if (writeErr) {
          console.error(`Failed to write file '${destination}' with error '${writeErr.toString()}'; quitting.`);
          callback();
          return;
        }

        fs.close(fd, (closeErr) => {
          if (closeErr) {
            console.warn(`Failed to close file '${destination}' with error '${closeErr.toString()}'.`);
          }

          callback();
        });
      })
    });
  });
};

module.exports = WebpackFileList;
