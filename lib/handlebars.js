let handlebars = require('handlebars');
let _ = require('lodash');

module.exports = (config) => {
  handlebars.registerHelper('replace', function(name, options) {
    return handlebars.helpers['content'].call(this, name, _.extend(options, { hash: { mode: 'replace' } } ));
  });
  handlebars.registerHelper('append', function(name, options) {
    return handlebars.helpers['content'].call(this, name, _.extend(options, { hash: { mode: 'append' } } ));
  });
  handlebars.registerHelper('prepend', function(name, options) {
    return handlebars.helpers['content'].call(this, name, _.extend(options, { hash: { mode: 'prepend' } } ));
  });

  handlebars.registerHelper('raw', function(options) {
    return options.fn(this);
  });
  handlebars.registerHelper('json', function(options){
    return JSON.stringify(options);
  });

  //Find layouts
  require('./layouts')(config, handlebars);

  return handlebars;
}