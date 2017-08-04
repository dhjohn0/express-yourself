let walk = require('walkdir');

module.exports = (dir, func, ext) => {
  walk.sync(dir, {
    'no_return': true
  }, (fullPath, stat) => {
    let c = fullPath;

    if (ext) {
      if (c.lastIndexOf(ext) === c.length - ext.length)
        c = c.substring(0, c.length - ext.length);
    }

    if (!stat.isDirectory())
      func(c);
  });
}