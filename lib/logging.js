module.exports = (config) => {
  let log = require('winston');
  if (!config.logging)
    config.logging = {};

  if (!config.logging.console || typeof(config.logging.console) === 'object')
    log.remove(log.transports.Console);
  if (typeof(config.logging.console) === 'object')
    log.add(log.transports.Console, config.logging.console);

  if (typeof(config.logging.file) === 'string') {
    log.add(log.transports.File, { 
      filename: config.logging.file
    });
  }
  if (typeof(config.logging.file) === 'object') {
    log.add(log.transports.File, config.logging.file);
  }

  if (config.logging.couchdb) {
    log.add(require('winston-couchdb').Couchdb, 
      typeof(config.logging.couchdb) === 'object' ? 
        config.logging.couchdb :
        config.db);
  }

  return log;
}