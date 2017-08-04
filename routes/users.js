module.exports = (app, options) => {
  app.get('/login', function (req, res) {
    res.render('users/login');
  });

  app.post('/login', app.passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: 'Invalid email and/or password',
    successFlash: 'Welcome!'
  }));

  app.get('/register', function (req, res) {
    res.render('users/register');
  });

  app.post('/register', app.passport.authenticate('register', {
    successRedirect: '/',
    failureRedirect: '/register',
    failureFlash: true,
    successFlash: 'Welcome!'
  }));
}