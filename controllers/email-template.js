let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');
let Promise = require('bluebird');

let CrudController = require('./_crud-controller');

module.exports = class EmailTemplateController extends CrudController {
  get prefix() { return '/email-template'; }

  get type() { return 'email-template'; }
  get userFriendlyName() { return 'Email Template'; }

  get validation() { 
    return {
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

  add(req, res) {
    res.render('email-template/add', {
      template: {}
    });
  }

  async create(req, res, db, _) {
    let template = req.body;

    let templates = await db.query('email-template/byName', { 
      key: template.name,
      include_docs: true 
    })

    if (templates.rows.length) {
      req.flash('error', 'Given name is already in use by another template');
      return res.redirect('/email-template/list');
    }
    
    return super.create(req, res, db, _);
  }

  actionChange(change, action) {
    switch (action) {
      case "Delete":
        change._deleted = true;
        return 'Email Template deleted';
    }
  }
};
