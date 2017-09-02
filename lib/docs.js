let path = require('path');
let _ = require('lodash');
let Promise = require('bluebird');
let checksum = require('checksum');

let doWalk = require('./helpers/doWalk');

let recursiveToString = (obj) => {
  let iterateFunc = _.mapValues;
  if (Array.isArray(obj))
    iterateFunc = _.map;
  return iterateFunc(obj, val => {
    if (typeof(val) === 'object')
      return recursiveToString(val);
    if (typeof(val) === 'function')
      return val.toString();
    return val;
  });
}

module.exports = (app, db, log, config) => {
  let ids = {};

  let promises = [];
  let cb = (c) => {
    let doc = recursiveToString(require(c));

    if (!doc._id) 
      log.warn(`Document '${c}' skipped: No _id`);
    else {
      if (ids[doc._id]) {
        log.debug(`Document '${c}' skipped: Document with given _id already processed`);
        return Promise.resolve();
      }
      ids[doc._id] = true;

      doc.checksum = checksum(JSON.stringify(doc));

      promises.push(db.get(doc._id).then((dbDoc) => {
        if (!dbDoc) {
          log.info(`Adding document '${c}'`);
          return db.put(doc);
        }

        if (!dbDoc.checksum || dbDoc.checksum !== doc.checksum) {
          log.info(`Updating document '${c}'`);
          doc._rev = dbDoc._rev;
          return db.put(doc).catch(err => {
            log.error(err);
          });
        }
      }, (err) => {
        log.info(`Adding document '${c}'`);
        return db.put(doc);
      }));
    }
  }

  let localPath = path.join(__dirname, '../', 'docs');
  doWalk(config.paths.docs, cb, '.js');
  if (localPath !== config.paths.docs)
    doWalk(localPath, cb, '.js');

  return Promise.all(promises);
}