let _ = require('lodash');
let PouchDB = require('pouchdb');

module.exports = (db) => {
  db.paginate = (viewName, start, length, options) => {
    start = parseInt(start) || 0;
    length = parseInt(length) || 0;

    if (!options) options = {};

    var objs = [];
    var pagination = {
      previous: start - length,
      start: start + 1,
      end: null,
      next: null
    };
    if (pagination.previous < 0) pagination.previous = null;

    if (typeof(options.include_docs) === 'undefined')
      options.include_docs = true;
    options = _.extend(options, {
      skip: start,
      limit: length + 1,
    });
    
    return db.query(viewName, options).then((_result) => {
      if (_result && _result.rows) {
        objs = _result.rows;
        if (objs.length > length) {
          objs.splice(length, objs.length - length);
          pagination.next = start + length;
        }
        objs = objs.map(row => options.include_docs ? row.doc :  row.value);
        pagination.end = start + objs.length;
      }

      return {
        list: objs,
        pagination: pagination
      };
    });
  };
};