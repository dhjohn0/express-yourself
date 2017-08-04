let _ = require('lodash');
let path = require('path');

module.exports = (appDirectory, config) => {
  config = _.merge({
    paths: {
      routes: 'routes',
      views: 'views',
      static: 'static',
      docs: 'docs'
    },
    db: {
      name: 'http://localhost:5984/express-template'
    }
  }, config);

  config.paths = _.mapValues(config.paths, (val) => path.join(appDirectory, val));

  return config;
}