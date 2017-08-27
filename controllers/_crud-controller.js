let uuid = require('uuid/v1');

let RestfulController = require('./_restful-controller');

module.exports = class CrudController extends RestfulController {
  get type() { return undefined; }

  get userFriendlyName() { return undefined; }

  async list(req, res, db, search, config) {
    if (!req.accepts('text/html')) {
      let start = parseInt(req.query.start) || 0;
      let length = parseInt(req.query.length) || 10;
      let sort = {
        column: req.query.sort,
        desc: req.query.desc === 'true' || false
      };

      let p;
      if (req.query.term && search) {
        p = await search.paginate(req.query.term, this.type, start, length, sort);
      }else{
        p = await db.paginate(`${this.type}/forList`, start, length, {
          start_key: [sort.column, !sort.desc ? null : {}],
          end_key: [sort.column, !sort.desc ? {} : null],
          descending: sort.desc
        });
      }

      return res.json({
        list: p.list.map(user => {
          delete user.password;
          return user;
        }),
        pagination: p.pagination,
        sort: sort
      });
    }
    return res.render(`${this.type}/list`);
  }

  async show(req, res, db) {
    if (!req.accepts('text/html')) {
      let item = await db.get(req.params.id);

      return res.json(item);
    }
    return res.render(`${this.type}/show`);
  }

  add(req, res) {
    res.render(`${this.type}/edit`);
  }

  async create(req, res, db, _) {
    let item = _.merge(req.body, {
      _id: uuid(),
      type: this.type
    });
    await db.put(item);
    
    if (!req.accepts('text/html')) {
      res.json({
        success: true,
        message: `${this.userFriendlyName} created`
      });
    }else{
      req.flash('success', `${this.userFriendlyName} created`);
      res.redirect(`${this.prefix}/list`);
    }
  }

  edit(req, res) {
    res.render(`${this.type}/edit`);
  }

  async update(req, res, db, _) {
    let dbItem = await db.get(req.params.id);

    let item = _.merge(req.body, {
      _id: dbItem._id,
      _rev: dbItem._rev,
      type: this.type
    });
    await db.put(item);
    
    if (!req.accepts('text/html')) {
      res.json({
        success: true,
        message: `${this.userFriendlyName} updated`
      });
    }else{
      req.flash('success', `${this.userFriendlyName} updated`);
      res.redirect(`${this.prefix}/list`);
    }
  }

  async destroy(req, res, db) {
    let item = await db.get(req.params.id);
    item._deleted = true;

    await db.put(item);

    if (!req.accepts('text/html')) {
      res.json({
        success: true,
        message: `${this.userFriendlyName} deleted`
      });
    }else{
      req.flash('success', `${this.userFriendlyName} deleted`);
      res.redirect(`${this.prefix}/list`);
    }
  }

  actionChange(obj, action) {
    return 'No op';
  }

  async action(req, res, db, _) {
    let ids = Array.isArray(req.body._id) || !req.body._id ? req.body._id : [ req.body._id ];
    
    if (ids && ids.length) {
      let result = await db.allDocs({
        keys: ids, 
        include_docs: true
      });

      let change = {};
      let resultMessage = this.actionChange(change, req.body.action);

      let docs = result.rows.map(row => {
        row.doc = _.extend(row.doc, change);
        return row.doc;
      });
      
      await db.bulkDocs(docs);
      if (req.accepts('text/html')) {
        res.json({
          success: true,
          message: resultMessage
        });
      }else{
        req.flash('success', resultMessage);
        res.redirect(`${this.prefix}/list`);
      }
    }else{
      if (req.accepts('text/html')) {
        res.json({
          success: false,
          message: `No ${this.type}s selected`
        });
      }else{
        req.flash('error', `No ${this.type}s selected`);
        res.redirect(`${this.prefix}/list`);
      }
    }
  }
};
