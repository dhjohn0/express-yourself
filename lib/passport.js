let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let bcrypt = require('bcrypt-nodejs');
let _ = require('lodash');
let uuid = require('uuid/v1');

module.exports = (app, db, log) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
   
  passport.deserializeUser((id, done) => {
    db.get(id).then((user) => {
      if (!user || !user.enabled)
        done(null, false);
      else{
        delete user.password;
        done(null, user);
      }
    }, (err) => {
      if (err.error === 'not_found')
        done(null, false);
      else{
        log.error(err);
        done(err, null);
      }
    });
  });

  passport.use('login', new LocalStrategy({
    passReqToCallback : true,
    usernameField: 'email'
  }, function (req, email, password, done) {
    db.query('user/byEmail', { 
      key: email, 
      include_docs: true 
    }).then(_users => {
      let users = _users.rows.map(r => r.doc);
      if (!users.length) {
        return done(null, false);
      }

      let user = users[0];
      if (!user.enabled || !bcrypt.compareSync(password, user.password)) {
        return done(null, false);
      }

      return done(null, user);
    }).catch((err) => {
      log.error(err);
    });
  }));

  return passport;
}