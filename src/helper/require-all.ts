var fs = require('fs');

var DEFAULT_EXCLUDE_DIR = /^\./;
var DEFAULT_FILTER = /^([^\.].*)\.(j|t)s(on)?$/;
var DEFAULT_RECURSIVE = true;

interface FileModules {
    [name: string] : any
}

export default function requireAll(options:any) {
  var dirname = typeof options === 'string' ? options : options.dirname;
  var excludeDirs = options.excludeDirs === undefined ? DEFAULT_EXCLUDE_DIR : options.excludeDirs;
  var filter = options.filter === undefined ? DEFAULT_FILTER : options.filter;
  var modules:FileModules = {};
  var recursive = options.recursive === undefined ? DEFAULT_RECURSIVE : options.recursive;
  var resolve = options.resolve || identity;
  var map = options.map || identity;

  function excludeDirectory(dirname:any) {
    return !recursive ||
      (excludeDirs && dirname.match(excludeDirs));
  }

  function filterFile(filename:string) {
    if (typeof filter === 'function') {
      return filter(filename);
    }

    var match = filename.match(filter);
    if (!match) return;

    return match[1] || match[0];
  }

  var files = fs.readdirSync(dirname);

  files.forEach(function (file:string) {
    var filepath = dirname + '/' + file;
    if (fs.statSync(filepath).isDirectory()) {

      if (excludeDirectory(file)) return;

      var subModules = requireAll({
        dirname: filepath,
        filter: filter,
        excludeDirs: excludeDirs,
        map: map,
        resolve: resolve
      });

      if (Object.keys(subModules).length === 0) return;

      modules[map(file, filepath)] = subModules;

    } else {
        var name = filterFile(file);
        if (!name) return;

        let target = resolve(require(filepath))
        if (target.default) target = target.default

        modules[map(name, filepath)] = target
    }
  });

  return modules;
};

function identity(val:any) {
  return val;
}