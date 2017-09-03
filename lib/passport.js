let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let bcrypt = require('bcrypt-nodejs');
let _ = require('lodash');
let uuid = require('uuid/v1');

module.exports = (app, db, config, log) => {
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

  if (config.logins.local) {
    passport.use('login', new LocalStrategy({
      passReqToCallback : true,
      usernameField: 'email'
    }, async (req, email, password, done) => {
      try{
        let _users = await db.query('user/byEmail', { 
          key: email, 
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

        return done(null, user);
      }catch(err) {
        log.error(err);
        done(err, null);
      };
    }));
  }

  if (config.logins.facebook) {
    passport.use('facebook', new FacebookStrategy({
      clientID: config.logins.facebook.clientID,
      clientSecret: config.logins.facebook.clientSecret,
      callbackURL: `${config.hostname}/login/facebook/callback`,
      scope: [ 'email', 'public_profile' ],
      profileFields: [ 'id', 'email', 'first_name', 'last_name', 'middle_name', 'displayName', 'picture.type(large)' ]
    }, async (accessToken, refreshToken, profile, done) => {
      try{
        let _users = await db.query('user/byFacebookId', { 
          key: profile.id, 
          include_docs: true 
        });
        let users = _users.rows.map(r => r.doc);
        if (!users.length) {
          users = [{
            _id: uuid(),
            enabled: true,
            confirmed: true,
            type: 'user'
          }];
          if (profile.emails && profile.emails.length)
            users[0].email = profile.emails[0].value;
          else
            return done(false, null);
        }else if (!users[0].enabled) {
          return done(false, null);
        }

        profile.providerId = profile.id;
        delete profile.id;
        delete profile._raw;
        delete profile._json;

        if (profile.photos && profile.photos.length) {
          profile.photo = profile.photos[0].value;
          delete profile.photos;
        }

        let user = _.merge(users[0], profile, {
          oauth: {
            accessToken,
            refreshToken
          }
        });

        if (user.emails && user.emails.length) {
          user.emails = _.filter(user.emails, email => email.value !== user.email);
        }

        await db.put(user);

        return done(null, user);
      }catch(err) {
        log.error(err);
        return done(err, null);
      }
    }));
  }

  return passport;
}