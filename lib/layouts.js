let _ = require('lodash');
let walk = require('walkdir');
let path = require('path');
let fs = require('fs');
let hbl = require('handlebars-layouts');

let localPath = path.join(__dirname, '../', 'views');

module.exports = (config, handlebars) => {
  hbl.register(handlebars);

  let buildLayouts = () => {
    let layouts = {};

    let cb = (fullPath, stat) => {
      let c = fullPath;

      if (!stat.isDirectory() && c.lastIndexOf('.layout.hbs') === c.length - 11) {
        c = c.substring(0, c.length - 11);
        let i = c.lastIndexOf(path.sep);
        if (i >= 0) {
          c = c.substring(i + 1);
        }

        if (!layouts[c]) {
          let file = fs.readFileSync(fullPath, 'utf8');
          layouts[c] = file;
        }
      }
    };

    walk.sync(config.paths.views, {
      'no_recurse': true,
      'no_return': true
    }, cb);
    if (localPath !== config.paths.views) {
      walk.sync(localPath, {
        'no_recurse': true,
        'no_return': true
      }, cb);
    }

    handlebars.registerPartial(layouts);
  }

  buildLayouts();
  if (config.develop) {
    fs.watch(config.paths.views, function () {
      buildLayouts();
    });
    if (localPath !== config.paths.views) {
      fs.watch(localPath, function () {
        buildLayouts();
      });
    }
  }

  return handlebars;
}