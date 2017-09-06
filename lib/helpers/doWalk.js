let walk = require('walkdir');
let fs = require('fs');

module.exports = (dir, func, ext) => {
  if (!fs.existsSync(dir))
    return;
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