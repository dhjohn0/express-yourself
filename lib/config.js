let _ = require('lodash');
let path = require('path');

module.exports = (appDirectory, config) => {
  config = _.merge({
    debug: true,
    paths: {
      controllers: 'controllers',
      views: 'views',
      static: 'static',
      docs: 'docs'
    },
    db: {
      host: 'localhost',
      port: 5984,
      db: 'express-yourself',
      secure: false
    },
    search: {
      host: 'http://localhost:9200',
      index: 'express-yourself'
    },
    logging: {
      console: { level: 'debug' },
      file: path.join('logs', 'log.txt'),
      couchdb: true
    },
    mailer: false,
    hostname: 'http://localhost:8080'
  }, config);

  config.paths = _.mapValues(config.paths, (val) => path.join(appDirectory, val));
  if (config.logging.file)
    config.logging.file = path.join(appDirectory, config.logging.file);

  config.db.name = 
    `http${config.db.secure ? 's' : ''}://${config.db.host}:${config.db.port}/${config.db.db}`;

  return config;
}