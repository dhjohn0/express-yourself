let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');
let Promise = require('bluebird');

let RestfulController = require('./_restful-controller');

module.exports = class UserController extends RestfulController {
  get prefix() { return '/user'; }

  list(req, res, db) {
    let start = req.query.start || 0;
    let length = req.query.length || 10;
    let sort = {
      column: req.query.sort || 'email',
      desc: req.query.desc || false
    };

    return db.paginate('users/forList', start, length, {
      start_key: [sort.column, !sort.desc ? null : {}],
      end_key: [sort.column, !sort.desc ? {} : null],
      descending: sort.desc
    }).then((p) => {
      res.render('user/list', {
        list: p.list,
        pagination: p.pagination,
        sort: sort
      });
    }).catch(e => {
      console.error(e);
    });
  }

  add(req, res) {
    res.render('user/add');
  }

  create(req, res, db, _) {
    let user = _.merge(req.body, {
      enabled: true,
      type: 'user'
    });

    return db.query('users/byEmail', { 
      key: user.email,
      include_docs: true 
    }).then(_users => {
      let users = _users.rows.map(r => r.doc);
      if (users.length) {
        req.flash('error', 'Given email is already in use by another account')
      }else{
        user.password = bcrypt.hashSync(user.password);
        user._id = uuid();

        return db.put(user).then(() => {
          req.flash('success', 'User created');
        });
      }
    }).then(() => {
      res.redirect('/user/add');
    });
  }

  action(req, res, db) {
    let ids = Array.isArray(req.body._id) || !req.body._id ? req.body._id : [ req.body._id ];
    
    Promise.resolve().then(() => {
      if (ids && ids.length) {
        return db.allDocs({
          keys: ids, 
          include_docs: true
        }).then(result => {
          let docs = result.rows.map(row => {
            switch (req.body.action) {
              case "Delete":
                row.doc._deleted = true;
                break;
              case "Enable":
                row.doc.enabled = true;
                break;
              case "Disable":
                row.doc.enabled = false;
                break;
            }
            return row.doc;
          });
          switch (req.body.action) {
            case "Delete":
              req.flash('success', 'Users deleted');
              break;
            case "Enable":
              req.flash('success', 'Users enabled');
              break;
            case "Disable":
              req.flash('success', 'Users disabled');
              break;
          }
          return db.bulkDocs(docs);
        })
      }else{
        req.flash('error', 'No users selected');
      }
      
  }).then(() => {
    res.redirect('/user/list');
  });
    
  }
};
