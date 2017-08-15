let path = require('path');
let doWalk = require('./helpers/doWalk');

module.exports = (app, options) => {
  let cb = (c) => {
    if (path.basename(c).indexOf('_') === 0)
      return;

    let Controller = require(c);
    let controller = new Controller(app);
  };

  let localPath = path.join(__dirname, '../', 'controllers');
  doWalk(options.paths.controllers, cb, '.js');
  if (localPath !== options.paths.controllers)
    doWalk(localPath, cb, '.js');
}