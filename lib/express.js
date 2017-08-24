let consolidate = require('consolidate');
let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');

module.exports = (options) => {
  let app = express()
    .set('views', [options.paths.views, path.join(__dirname, '../', 'views')])
    .set('view engine', 'hbs')
    .engine('hbs', consolidate.handlebars);

  app.use(require('cookie-session')({
    name: 'session',
    keys: ['keyboard cat']
  }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(require('connect-flash')());
  app.use(express.static(options.paths.static));
  app.use(express.static(path.join(__dirname, '../', 'static')));
  app.use(require('method-override')('_method'));

  return app;
}