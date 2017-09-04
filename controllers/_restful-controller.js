let serialize = require('serialize-javascript');
let CheckYourself = require('check-yourself');

let Controller = require('./_controller');

let validationInjectMiddleware = (validation) => {
  return function (req, res, next) {
    if (validation) {
      res.locals.validationOptions = serialize(validation);
    }
    next();
  }
};

module.exports = class RestfulController extends Controller {
  get validation() { return undefined; }

  validationMiddleware(req, res, next) {
    if (!this.validation)
      return next();

    let cy = new CheckYourself(this.validation);

    let obj = req.body;
    let result = cy.check(obj);
    if (result.failed) {
      if (!req.accepts('text/html')) {
        res.json({
          success: false,
          errors: result.errors
        });
      }else{
        res.render('error', {
          header: 'Validation Failed',
          errors: result.errors
        });
      }
    }else{
      next();
    }
  }

  get get() {
    return {
      '/list': !this.list ? [] : this.list,
      '/search': !this.search ? [] : this.search,
      '/add': !this.add ? [] : [ validationInjectMiddleware(this.validation), this.add ],
      '/:id': !this.show ? [] : this.show,
      '/:id/edit': !this.edit ? [] : [ validationInjectMiddleware(this.validation), this.edit ]
    };
  }

  get post() {
    return {
      '/': !this.create ? [] : [ this.validationMiddleware, this.create ],
      '/action': !this.action ? [] : this.action
    };
  }

  get put() {
    return {
      '/:id': !this.update ? [] : [ this.validationMiddleware, this.update ]
    };
  }

  get delete() {
    return {
      '/:id': !this.destroy ? [] : [ this.validationMiddleware, this.destroy ]
    };
  }
}