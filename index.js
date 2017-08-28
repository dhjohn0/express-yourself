let path = require('path');
let fs = require('fs');
let _ = require('lodash');
let PouchDB = require('pouchdb');

module.exports = async (appDirectory, config) => {
  //Setup injection
  let di = require('./lib/di')();
  di.value('appDirectory', appDirectory);
  di.value('config', config);
  di.value('di', di);

  config = di.invoke(require('./lib/config'));
  di.value('config', config);
  
  //Setup logging
  let log = di.invoke(require('./lib/logging'));
  di.value('log', log);

  //Setup handlebars
  let handlebars = di.invoke(require('./lib/handlebars'));
  di.value('handlebars', handlebars);

  //Setup db connection
  let db = new PouchDB(config.db);
  di.value('db', db);

  //Setup elasticsearch
  let search = await di.invoke(require('./lib/elastic'));
  di.value('search', search);

  //Setup paginate helpers
  di.invoke(require('./lib/helpers/paginate'));

  //Setup express
  let app = di.invoke(require('./lib/express'));
  di.value('app', app);
  app.log = log;
  app.di = di;

  //Setup passport
  let passport = di.invoke(require('./lib/passport'));
  di.value('passport', passport);
  app.passport = passport;
  
  di.value('_', _);
  di.factory('user', function (req) {
    return req.user;
  });

  //Setup Mailer
  let mailer = di.invoke(require('./lib/mailer'));
  di.value('mailer', mailer);

  //Setup controllers
  di.invoke(require('./lib/controllers'));

  //Setup docs
  await di.invoke(require('./lib/docs'));

  //Setup crons
  di.invoke(require('./lib/crons'));
  
  return app;
}
