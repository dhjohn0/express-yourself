let _ = require('lodash');
let PouchDB = require('pouchdb');

module.exports = (db, search, config) => {
  db.paginate = (viewName, start, length, options) => {
    start = parseInt(start) || 0;
    length = parseInt(length) || 0;

    if (!options) options = {};

    var objs = [];
    var pagination = {
      previous: start - length,
      start: start + 1,
      end: null,
      length: length,
      next: null
    };
    if (pagination.previous < 0) {
      if (start <= 0)
        pagination.previous = null;
      else
        pagination.previous = 0;
    }

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

  if (search) {
    search.paginate = async (searchTerm, type, start, length, sort) => {
      start = parseInt(start) || 0;
      length = parseInt(length) || 0;

      if (!sort) {
        sort = {
          column: '_score',
          desc: true
        }
      }

      let opts = {
        index: config.search.index,
        type: type,
        q: searchTerm.indexOf(':') >= 0 ? searchTerm : `_all:${searchTerm}`,
        from: start,
        size: length,
        sort: `${sort.column}:${sort.desc ? 'desc' : 'asc'}`
      };
      console.log(opts);
      let results = await search.search(opts);

      let p = {
        list: results.hits.hits.map(v => {
          v._source._id = v._id;
          return v._source;
        }),
        pagination: {
          previous: start - length,
          start: start + 1,
          end: start + results.hits.hits.length,
          length: length,
          next: (results.hits.total > start + length) ? start + length : null
        }
      };
      if (p.pagination.previous < 0) {
        if (start <= 0)
          p.pagination.previous = null;
        else
          p.pagination.previous = 0;
      }
      return p;
    }
  }
};