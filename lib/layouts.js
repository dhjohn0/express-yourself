let _ = require('lodash');
let walk = require('walkdir');
let path = require('path');
let fs = require('fs');
let hbl = require('handlebars-layouts');

module.exports = (config, handlebars) => {
  hbl.register(handlebars);

  let buildLayouts = () => {
    let layouts = {};
    walk.sync(config.paths.views, {
      'no_recurse': true,
      'no_return': true
    }, (fullPath, stat) => {
      let c = fullPath;

      if (!stat.isDirectory() && c.lastIndexOf('.layout.hbs') === c.length - 11) {
        c = c.substring(0, c.length - 11);
        let i = c.lastIndexOf(path.sep);
        if (i >= 0) {
          c = c.substring(i + 1);
        }

        let file = fs.readFileSync(fullPath, 'utf8');
        layouts[c] = file;
      }
    });

    handlebars.registerPartial(layouts);
  }

  buildLayouts();
  if (config.debug) {
    fs.watch(config.paths.views, function () {
      buildLayouts();
    })
  }

  return handlebars;
}