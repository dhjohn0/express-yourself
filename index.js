let path = require('path');
let fs = require('fs');
let _ = require('lodash');
let PouchDB = require('pouchdb');

module.exports = (dirpath, config) => {
  config = require('./lib/config')(dirpath, config);
  
  //Setup logging
  let log = require('./lib/logging')(config);

  //Setup handlebars
  let handlebars = require('./lib/handlebars')(config, log);

  //Setup db connection
  let db = new PouchDB(config.db);
  require('./lib/helpers/paginate')(db, log);


  //Setup express
  let app = require('./lib/express')(config, log);
  app.log = log;

  //Setup passport
  let passport = require('./lib/passport')(app, db, log);
  app.passport = passport;

  //Setup injection
  let di = require('./lib/di')(app, log);
  di.value('_', _);
  di.value('config', config);
  di.value('db', db);
  di.value('handlebars', handlebars);
  di.value('passport', passport);

  di.factory('user', function (req) {
    return req.user;
  });
  di.value('log', log);

  //Setup Mailer
  let mailer = require('./lib/mailer')(config, db, handlebars, log);
  di.value('mailer', mailer);

  //Setup controllers
  require('./lib/controllers')(app, log, config);

  //mailer.send('dhjohn0@gmail.com', 'Test', '<strong>HELLO!</strong>');

  //Setup docs
  return require('./lib/docs')(app, db, log, config).then(() => {
    return app;
  });
}
