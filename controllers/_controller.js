let _ = require('lodash');

module.exports = class Controller {
  constructor(router, log) {
    this.router = router;
    this.log = log;

    this.configRouter();  
  }

  configRouter() {
    let methods = ['get', 'post', 'put', 'delete'];

    methods.forEach((method) => {
      _.forOwn(this[method], (route, key) => {
        if (!Array.isArray(route))
          route = [ route ];

        route.unshift(this.authorize);

        route = route.map((fx) => {
          return (req, res, next) => {
            this.router.di.invoke(fx, this, {
              req,
              res,
              next
            });
          }
        });

        this.router[method](this.prefix + key, ...route);
      });
    });
  }

  get prefix() { return '' }

  authorize(req, res, next, user) {
    return next();
  }

  get get() { return {}; }
  get post() { return {}; }
  get put() { return {}; }
  get delete() { return {}; }
};
