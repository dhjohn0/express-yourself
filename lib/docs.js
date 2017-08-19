let path = require('path');
let _ = require('lodash');
let Promise = require('bluebird');
let checksum = require('checksum');

let doWalk = require('./helpers/doWalk');

let recursiveToString = (obj) => {
  return _.mapValues(obj, val => {
    if (typeof(val) === 'object')
      return recursiveToString(val);
    if (typeof(val) === 'function')
      return val.toString();
    return val;
  });
}

module.exports = (app, db, log, options) => {
  let promises = [];
  let cb = (c) => {
    let doc = recursiveToString(require(c));

    if (!doc._id) 
      log.warn(`Document '${c}' skipped: No _id`);
    else {
      doc.checksum = checksum(JSON.stringify(doc));

      promises.push(db.get(doc._id).then((dbDoc) => {
        if (!dbDoc) {
          log.info(`Adding document '${c}'`);
          return db.put(doc);
        }

        if (!dbDoc.checksum || dbDoc.checksum !== doc.checksum) {
          log.info(`Updating document '${c}'`);
          doc._rev = dbDoc._rev;
          return db.put(doc);
        }
      }, (err) => {
        log.info(`Adding document '${c}'`);
        return db.put(doc);
      }));
    }
  }

  let localPath = path.join(__dirname, '../', 'docs');
  doWalk(options.paths.docs, cb, '.js');
  if (localPath !== options.paths.docs)
    doWalk(localPath, cb, '.js');

  return Promise.all(promises);
}