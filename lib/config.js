let _ = require('lodash');
let path = require('path');

module.exports = (appDirectory, config) => {
  config = _.merge({
    develop: true,
    paths: {
      controllers: 'controllers',
      views: 'views',
      static: 'static',
      less: 'less',
      docs: 'docs',
      crons: 'crons',
      uploads: '/tmp'
    },
    db: {
      host: 'localhost',
      port: 5984,
      db: 'express-yourself',
      secure: false
    },
    logins: {
      local: true,
      facebook: false
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

  if (appDirectory) {
    config.paths = _.mapValues(config.paths, (val) => {
      if (path.isAbsolute(val))
        return val;
      return path.join(appDirectory, val)
    });
    if (config.logging.file)
      config.logging.file = path.join(appDirectory, config.logging.file);
  }
  config.db.name = 
    `http${config.db.secure ? 's' : ''}://${config.db.host}:${config.db.port}/${config.db.db}`;

  return config;
}