let serialize = require('serialize-javascript');
let CheckYourself = require('check-yourself');

let Controller = require('./controller');

let validationInjectMiddleware = (validation) => {
  return function (req, res, next) {
    if (validation) {
      res.locals.validationOptions = serialize(validation);
    }
    next();
  }
};

let validationMiddleware = (validation) => {
  if (validation) {
    let cy = new CheckYourself(validation);

    return function (req, res, next) {
      let obj = req.body;
      let result = cy.check(obj);
      if (result.failed) {
        res.send(result.errors);
      }else{
        next();
      }
    }
  }else{
    return function (req, res, next) {
      next();
    }
  }
}

module.exports = class RestfulController extends Controller {
  constructor(router) {
    super(router);
  }

  get validation() { return undefined; }

  get get() {
    return {
      '/list': !this.list ? [] : this.list,
      '/add': !this.add ? [] : [ validationInjectMiddleware(this.validation), this.add ],
      '/:id': !this.show ? [] : this.show,
      '/:id/edit': !this.edit ? [] : [ validationInjectMiddleware(this.validation), this.edit ]
    };
  }

  get post() {
    return {
      '/': !this.create ? [] : [validationMiddleware(this.validation), this.create],
      '/action': !this.action ? [] : this.action
    };
  }

  get put() {
    return {
      '/:id': !this.update ? [] : [validationMiddleware(this.validation), this.update]
    };
  }

  get delete() {
    return {
      '/:id': !this.update ? [] : [validationMiddleware(this.validation), this.delete]
    };
  }
}