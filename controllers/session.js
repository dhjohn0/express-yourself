let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');

module.exports = ({ Controller, passport }) => {
  return class SessionController extends Controller {

    get get() {
      return {
        '/login': function (req, res) {
          res.render('session/login');
        }
      };
    }

    get post() {
      return {
        '/login': [
          passport.authenticate('login', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: 'Invalid email and/or password',
            successFlash: 'Welcome!'
          })
        ]
      };
    }
  }
}
