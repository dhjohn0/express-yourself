module.exports = (config) => {
  let log = require('winston')

  if (!config.logging.console)
    log.remove(log.transports.Console);
  if (config.logging.file) {
    log.add(log.transports.File, { 
      filename: config.logging.file
    });
  }
  if (config.logging.couchdb) {
    log.add(require('winston-couchdb').Couchdb, config.db);
  }

  return log;
}