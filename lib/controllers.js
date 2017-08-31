let path = require('path');
let doWalk = require('./helpers/doWalk');

module.exports = (app, log, config) => {
  let cb = (c) => {
    if (path.basename(c).indexOf('_') === 0)
      return;

    try{
      let Controller = require(c);
      let controller = new Controller(app, log);
    }catch(e) {
      log.error(e);
    }
  };

  let localPath = path.join(__dirname, '../', 'controllers');
  doWalk(config.paths.controllers, cb, '.js');
  if (localPath !== config.paths.controllers)
    doWalk(localPath, cb, '.js');
}