let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');
let passport = require('passport');

let Controller = require('./_controller');

module.exports = class SessionController extends Controller {
  get get() {
    return {
      '/login': function (req, res) {
        res.render('session/login');
      },
      '/logout': (req, res, user) => {
        this.log.info(`User ${user.email} logged out successfully`);
        req.logout();
        req.flash('success', 'You have been successfully logged out');

        res.redirect('/');
      }
    };
  }

  get post() {
    return {
      '/login': [
        passport.authenticate('login', {
          failureRedirect: '/login',
          failureFlash: 'Invalid email and/or password'
        }),
        (req, res, user) => {
          req.flash('success', 'Welcome');
          this.log.info(`User ${user.email} logged in successfully`);
          res.redirect(req.query.redirect || '/');
        }
      ],
      '/logout': (req, res, user) => {
        req.logout();
        req.flash('success', 'You have been successfully logged out');
        this.log.info(`User ${user.email} logged out successfully`);

        res.redirect('/');
      }
    };
  }
}
