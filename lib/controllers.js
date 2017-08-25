let path = require('path');
let doWalk = require('./helpers/doWalk');

module.exports = (app, log, config) => {
  let cb = (c) => {
    if (path.basename(c).indexOf('_') === 0)
      return;

    let Controller = require(c);
    let controller = new Controller(app, log);
  };

  let localPath = path.join(__dirname, '../', 'controllers');
  doWalk(config.paths.controllers, cb, '.js');
  if (localPath !== config.paths.controllers)
    doWalk(localPath, cb, '.js');
}