let _ = require('lodash');

module.exports = class Controller {
  constructor(router) {
    this.router = router;

    this.configRouter();  
  }

  configRouter() {
    let methods = ['get', 'post', 'put', 'delete'];

    methods.forEach((method) => {
      _.forOwn(this[method], (route, key) => {
        if (Array.isArray(route))
          this.router[method](this.prefix + key, ...route);
        else
          this.router[method](this.prefix + key, route);
      });
    });
  }

  get prefix() { return '' }

  get get() { return {}; }
  get post() { return {}; }
  get put() { return {}; }
  get delete() { return {}; }
};
