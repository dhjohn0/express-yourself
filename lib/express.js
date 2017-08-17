let consolidate = require('consolidate');
let express = require('express');
let path = require('path');

module.exports = (options) => {
  let app = express()
    .set('views', [options.paths.views, path.join(__dirname, '../', 'views')])
    .set('view engine', 'hbs')
    .engine('hbs', consolidate.handlebars);

  app.use(require('cookie-parser')());
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
  app.use(require('connect-flash')());
  app.use(express.static(options.paths.static));
  app.use(express.static(path.join(__dirname, '../', 'static')));
  app.use(require('method-override')('_method'));

  //Build global locals
  app.use(function (req, res, next) {
    res.locals.flash = {
      success: req.flash('success'),
      info: req.flash('info'),
      warn: req.flash('warn'),
      error: req.flash('error')
    };

    res.locals.user = req.user;
    next();
  });

  return app;
}