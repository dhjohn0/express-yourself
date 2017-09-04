let _ = require('lodash');

let fnName = (fn) => {
  let regex = /^(async[\s]+)?(function[\s]+)?(.*?)[\s]*({|=>)/;
  let matches = regex.exec(fn.toString());

  if (!matches)
    return '';
  return matches[3];
}

module.exports = class Controller {
  constructor(router, log, di) {
    this.router = router;
    this.log = log;
    this.di = di;

    this.configRouter();  
  }

  configRouter() {
    let methods = ['get', 'post', 'put', 'delete'];

    methods.forEach((method) => {
      _.forOwn(this[method], (route, key) => {
        if (!Array.isArray(route))
          route = [ route ];

        route.unshift(this.addLocals);
        route.unshift(this.authorize);

        route = route.map((fx, index) => {
          return async (req, res, next) => {
            this.log.debug(`Calling '${fnName(fx)}' for route '${req.method}:${req.path}'`);
            try{
              return await this.di.invoke(fx, this, {
                req, res, next
              });
            }catch(err) {
              this.log.error(err);
              res.status(500);
              return res.send(
`<html lang="en"><head><meta charset="utf-8"><title>Error</title></head>
<body><pre>${err.stack ? err.stack.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/ /g, '&nbsp;').replace(/\n/g, '<br/>') : ''}</pre>
</body></html>`
              );
            };
          }
        });

        this.router[method](this.prefix + key, ...route);
      });
    });
  }

  get prefix() { return '' }

  addLocals(req, res, next) {
    res.locals.flash = {
      success: req.flash('success'),
      info: req.flash('info'),
      warn: req.flash('warn'),
      error: req.flash('error')
    };

    res.locals.user = req.user;

    res.locals.query = req.query;
    res.locals.params = req.params;
    
    return next();
  }

  authorize(req, res, next, user) {
    return next();
  }

  get get() { return {}; }
  get post() { return {}; }
  get put() { return {}; }
  get delete() { return {}; }
};
