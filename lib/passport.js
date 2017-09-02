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
    usernameField: 'username'
  }, async (req, username, password, done) => {
    try{
      let _users = await db.query('user/byUsername', { 
        key: username, 
        include_docs: true 
      });

      let users = _users.rows.map(r => r.doc);
      if (!users.length) {
        return done(null, false);
      }
      let user = users[0];
      if (!user.enabled || user.provider !== 'local') {
        return done(null, false);
      }

      let _passes = await db.query('user/userPassword', { key: user._id });
      let passes = _passes.rows.map(r => r.value);
      if (!passes.length) {
        return done(null, false);
      }
      let pass = passes[0];

      if (!bcrypt.compareSync(password, pass)) {
        return done(null, false);
      }
      console.log(5);

      return done(null, user);
    }catch(err) {
      log.error(err);
      done(err, null);
    };
  }));

  return passport;
}