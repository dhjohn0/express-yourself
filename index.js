let path = require('path');
let fs = require('fs');
let _ = require('lodash');
let PouchDB = require('pouchdb');

module.exports = (dirpath, options) => {
  options = require('./lib/config')(dirpath, options);

  //Setup handlebars
  let handlebars = require('./lib/handlebars')(options);

  //Setup db connection
  let db = new PouchDB(options.db);

  //Setup express
  let app = require('./lib/express')(options);

  //Setup passport
  let passport = require('./lib/passport')(app, db);
  app.passport = passport;

  //Setup injection
  let di = require('./lib/di')(app);
  di.value('_', _);
  di.value('db', db);
  di.value('handlebars', handlebars);
  di.value('passport', passport);

  di('user', function (req, res, next) {
    res.locals.user = req.user;
    next(null, req.user);
  });

  di('flash', function (req, res, next) {
    next(null, req.flash);
  });

  //Setup routes
  require('./lib/routes')(app, options);

  //Setup docs
  return require('./lib/docs')(app, db, options).then(() => {
    return app;
  });
}
