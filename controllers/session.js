let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');
let passport = require('passport');

let Controller = require('./_controller');

module.exports = class SessionController extends Controller {
  get get() {
    return {
      '/login': function (req, res) {
        return res.render('session/login');
      },
      '/logout': (req, res, user) => {
        this.log.info(`User ${user.email} logged out successfully`);
        req.logout();
        req.flash('success', 'You have been successfully logged out');

        return res.redirect('/');
      },
      '/login/facebook': passport.authenticate('facebook'),
      '/login/facebook/callback': [
        passport.authenticate('facebook', {
          failureRedirect: '/login',
          failureFlash: 'Could not log you in via Facebook.'
        }),
        (req, res, user) => {
          req.flash('success', 'Welcome');
          this.log.info(`User ${user.email} logged in successfully`);
          return res.redirect(req.query.redirect || '/');
        }
      ]
    };
  }

  get post() {
    return {
      '/login': [
        passport.authenticate('login', {
          failureRedirect: '/login',
          failureFlash: 'Invalid username and/or password'
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
