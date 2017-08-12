let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');

module.exports = ({ RestfulController }) => {
  return class UserController extends RestfulController {
    get prefix() { return '/user'; }

    get validation() { return {
      strict: true,
      fields: [
        { 
          name: 'email',
          checks: [ 
            { test: 'required', message: 'Email is required' },
            { test: 'email', message: 'Email must be a valid email address' }
          ]
        }, { 
          name: 'password',
          checks: [ 
            { test: 'required', message: 'Password is required' }
          ]
        }, {
          name: /^phone\.[0-9]+$/,
          errorName: 'phone',
          checks: [
            { 
              test: /^([2-9]\d{2})(\D*)([2-9]\d{2})(\D*)(\d{4})$/,
              message: 'Invalid phone'
            }
          ]
        }
      ]
    };
  }

    add(req, res) {
      res.render('user/add');
    }

    create(req, res, db, _) {
      let user = _.merge(req.body, {
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
  };
}
