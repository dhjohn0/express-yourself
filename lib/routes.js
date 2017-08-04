let path = require('path');
let doWalk = require('./helpers/doWalk');

module.exports = (app, options) => {
  let cb = (c) => {
    let route = require(c);
    route(app, options);
  };

  let localPath = path.join(__dirname, '../', 'routes');
  doWalk(options.paths.routes, cb, '.js');
  if (localPath !== options.paths.routes)
    doWalk(localPath, cb, '.js');
}