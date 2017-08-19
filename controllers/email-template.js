let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');
let Promise = require('bluebird');

let RestfulController = require('./_restful-controller');

module.exports = class UserController extends RestfulController {
  get prefix() { return '/email-template'; }

  get validation() { 
    return {
      strict: true,
      fields: [
        { 
          name: 'name',
          checks: [ 
            { test: 'required', message: 'Name is required' }
          ]
        }, { 
          name: 'subject',
          checks: [ 
            { test: 'required', message: 'Subject is required' }
          ]
        }, { 
          name: 'body',
          checks: [ 
            { test: 'required', message: 'Body is required' }
          ]
        }
      ]
    };
  }

  async list(req, res, db) {
    let start = parseInt(req.query.start) || 0;
    let length = parseInt(req.query.length) || 10;
    let sort = {
      column: req.query.sort || 'name',
      desc: req.query.desc === 'true' || false
    };

    if (req.headers && req.headers['accept'] && req.headers['accept'].toLowerCase().indexOf('application/json') >= 0) {
      let p = await db.paginate('emailTemplates/forList', start, length, {
        start_key: [sort.column, !sort.desc ? null : {}],
        end_key: [sort.column, !sort.desc ? {} : null],
        descending: sort.desc
      });

      return res.json({
        list: p.list,
        pagination: p.pagination,
        sort: sort
      });
    }

    return res.render('email-template/list', {
      query: {
        start,
        length,
        sort: sort.column,
        desc: sort.desc
      }
    });
  }

  add(req, res) {
    res.render('email-template/add', {
      template: {}
    });
  }

  async create(req, res, db, _) {
    let template = _.merge(req.body, {
      type: 'email-template'
    });

    let templates = await db.query('emailTemplates/byName', { 
      key: template.name,
      include_docs: true 
    })

    if (templates.rows.length) {
      req.flash('error', 'Given name is already in use by another template');
    }else{
      template._id = uuid();

      await db.put(template);
      
      req.flash('success', 'Email template created');
    }
    res.redirect('/email-template/list');
  }

  async edit(req, res, db) {
    let template = await db.get(req.params.id);
    res.render('email-template/add', {template});
  }

  async action(req, res, db, _) {
    let ids = Array.isArray(req.body._id) || !req.body._id ? req.body._id : [ req.body._id ];
    
    if (ids && ids.length) {
      let result = await db.allDocs({
        keys: ids, 
        include_docs: true
      });

      let change = {};
      switch (req.body.action) {
        case "Delete":
          change._deleted = true;
          break;
        case "Enable":
          change.enabled = true;
          break;
        case "Disable":
          change.enabled = false;
          break;
      }

      let docs = result.rows.map(row => {
        row.doc = _.extend(row.doc, change);
        return row.doc;
      });
      
      req.flash('success', `Users ${req.body.action}d`);
      await db.bulkDocs(docs);
    }else{
      req.flash('error', 'No users selected');
    }
      
    res.redirect('/user/list');
  }
};
