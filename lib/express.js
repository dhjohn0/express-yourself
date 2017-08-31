let consolidate = require('consolidate');
let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let multer = require('multer');

module.exports = (config) => {
  let upload = multer({
    dest: config.paths.uploads
  });
  let app = express()
    .set('views', [config.paths.views, path.join(__dirname, '../', 'views')])
    .set('view engine', 'hbs')
    .engine('hbs', consolidate.handlebars);

  app.use(require('method-override')('_method'));
  app.use(require('cookie-session')({
    name: 'session',
    keys: ['keyboard cat']
  }));
  app.use(upload.any());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(require('connect-flash')());
  app.use(express.static(config.paths.static));
  app.use(express.static(path.join(__dirname, '../', 'static')));

  return app;
}