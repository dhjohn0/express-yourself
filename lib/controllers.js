let path = require('path');
let doWalk = require('./helpers/doWalk');

let Controller = require('./controllers/controller');
let RestfulController = require('./controllers/restful-controller');

module.exports = (app, options) => {
  let cb = (c) => {
    let Con = require(c)({
      Controller,
      RestfulController,
      passport: app.passport
    });
    let controller = new Con(app);
  };

  let localPath = path.join(__dirname, '../', 'controllers');
  doWalk(options.paths.controllers, cb, '.js');
  if (localPath !== options.paths.controllers)
    doWalk(localPath, cb, '.js');
}