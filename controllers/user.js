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

    create(req, res) {
      res.redirect('/user/add');
    }
  };
}
