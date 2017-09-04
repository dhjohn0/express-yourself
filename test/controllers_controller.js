let assert = require('assert');
let sinon = require('sinon');

describe('controllers/Controller', () => {
  describe('#constructor(router, log)', () => {
    it('should assign args to object', () => {
      let Controller = require('../controllers/_controller');
      
      class TestController extends Controller {
        configRouter() {}
      }

      let router = {};
      let log = {};

      let c = new TestController(router, log);

      assert.strictEqual(c.router, router);
      assert.strictEqual(c.log, log);
    });

    it('should call configRouter', () => {
      let Controller = require('../controllers/_controller');
      let configRouterSpy = sinon.stub();
      
      class TestController extends Controller {
        configRouter() { configRouterSpy(); }
      }

      let router = {};
      let log = {};
      let di = {};

      let c = new TestController(router, log, di);

      assert(configRouterSpy.called);
    });
  });

  describe('#configRouter()', () => {
    it('should call router.get with correct route', () => {
      let Controller = require('../controllers/_controller');

      class TestController extends Controller {
        get get() {
          return {
            '/foo': () => {}
          };
        }
      }

      let router = {
        get: sinon.stub()
      }
      let di = {
        invoke: sinon.stub()
      }
      let log = {
        debug: sinon.stub(),
        error: sinon.stub()
      }

      let c = new TestController(router, log, di);

      assert(router.get.called);
      assert.equal('/foo', router.get.getCall(0).args[0]);
    });

    it('should pass addLocals and authorize to router.post', async () => {
      let Controller = require('../controllers/_controller');
      class TestController extends Controller {
        get post() {
          return {
            '/foo': () => {}
          };
        }
      }

      let router = {
        post: sinon.stub()
      }
      let di = {
        invoke: sinon.stub()
      }
      let log = {
        debug: sinon.stub(),
        error: sinon.stub()
      }

      let c = new TestController(router, log, di);

      assert(router.post.called);
      //Call wrapper func so invoke is called
      await router.post.getCall(0).args.slice(1).map(async arg => {
        return await arg({
          method: 'GET',
          path: '/foo'
        }, null, null);
      });

      assert(di.invoke.getCall(0).calledWith(c.authorize));
      assert(di.invoke.getCall(1).calledWith(c.addLocals));
    });

    it('should pass route fx to router.post', async () => {
      let Controller = require('../controllers/_controller');
      let fx = () => {}

      class TestController extends Controller {
        get post() {
          return {
            '/foo': fx
          };
        }
      }

      let router = {
        post: sinon.stub()
      }
      let di = {
        invoke: sinon.stub()
      }
      let log = {
        debug: sinon.stub(),
        error: sinon.stub()
      }

      let c = new TestController(router, log, di);

      assert(router.post.called);
      //Call wrapper func so invoke is called
      await router.post.getCall(0).args.slice(1).map(async arg => {
        return await arg({
          method: 'GET',
          path: '/foo'
        }, null, null);
      });

      assert(di.invoke.getCall(2).calledWith(fx));
    });

    it('should pass all route fxs to router.post when given an array of routes', async () => {
      let Controller = require('../controllers/_controller');
      let fx = () => {};
      let fx2 = (req) => {};

      class TestController extends Controller {
        get post() {
          return {
            '/foo': [fx, fx2]
          };
        }
      }

      let router = {
        post: sinon.stub()
      }
      let di = {
        invoke: sinon.stub()
      }
      let log = {
        debug: sinon.stub(),
        error: sinon.stub()
      }

      let c = new TestController(router, log, di);

      assert(router.post.called);
      //Call wrapper func so invoke is called
      await router.post.getCall(0).args.slice(1).map(async arg => {
        return await arg({
          method: 'GET',
          path: '/foo'
        }, null, null);
      });

      assert(di.invoke.getCall(2).calledWith(fx));
      assert(di.invoke.getCall(3).calledWith(fx2));
    });

    it('should invoke each route fx with controller as the context', async () => {
      let Controller = require('../controllers/_controller');
      let fx = () => {}

      class TestController extends Controller {
        get post() {
          return {
            '/foo': fx
          };
        }
      }

      let router = {
        post: sinon.stub()
      }
      let di = {
        invoke: sinon.stub()
      }
      let log = {
        debug: sinon.stub(),
        error: sinon.stub()
      }

      let c = new TestController(router, log, di);

      assert(router.post.called);
      //Call wrapper func so invoke is called
      await router.post.getCall(0).args.slice(1).map(async arg => {
        return await arg({
          method: 'GET',
          path: '/foo'
        }, null, null);
      });

      assert(di.invoke.alwaysCalledWith(sinon.match.any, c));
    });

    it('should send an 500 response if an exception was thrown', async () => {
      let Controller = require('../controllers/_controller');
      let fx = () => {}

      class TestController extends Controller {
        get put() {
          return {
            '/foo': fx
          };
        }
      }

      let router = {
        put: sinon.stub()
      }
      let invokeStub = sinon.stub();
      invokeStub.onCall(1).throws(() => { return 'Message'; })
      invokeStub.throws();
      let di = {
        invoke: invokeStub
      }
      let log = {
        debug: sinon.stub(),
        error: sinon.stub()
      }

      let res = {
        status: sinon.stub(),
        send: sinon.stub()
      }

      let c = new TestController(router, log, di);

      assert(router.put.called);
      //Call wrapper func so invoke is called
      await router.put.getCall(0).args.slice(1).map(async arg => {
        return await arg({
          method: 'PUT',
          path: '/foo'
        }, res, null);
      });

      assert(res.status.calledWith(500));
      assert(res.send.calledWith(sinon.match.string));
    });
  });

  describe('#addLocals(req, res, next)', () => {
    it('should apply flash to locals', () => {
      let Controller = require('../controllers/_controller');
      class TestController extends Controller {
        configRouter() {}
      }

      let req = {
        flash: sinon.stub().returnsArg(0)
      };
      let res = {
        locals: {}
      };
      let next = sinon.stub();

      let c = new TestController({}, {}, {});
      c.addLocals(req, res, next);

      assert.deepEqual(res.locals.flash, {
        success: 'success',
        info: 'info',
        warn: 'warn',
        error: 'error'
      });
    });

    it('should apply user to locals', () => {
      let Controller = require('../controllers/_controller');
      class TestController extends Controller {
        configRouter() {}
      }

      let req = {
        flash: sinon.stub().returnsArg(0),
        user: { _id: '0' }
      };
      let res = {
        locals: {}
      };
      let next = sinon.stub();

      let c = new TestController({}, {}, {});
      c.addLocals(req, res, next);

      assert.strictEqual(res.locals.user, req.user);
    });

    it('should apply query and params to locals', () => {
      let Controller = require('../controllers/_controller');
      class TestController extends Controller {
        configRouter() {}
      }

      let req = {
        flash: sinon.stub().returnsArg(0),
        query: {
          term: 'search'
        },
        params: {
          id: '0'
        }
      };
      let res = {
        locals: {}
      };
      let next = sinon.stub();

      let c = new TestController({}, {}, {});
      c.addLocals(req, res, next);

      assert.strictEqual(res.locals.query, req.query);
      assert.strictEqual(res.locals.params, req.params);
    });
  });

  describe('#authorize()', () => {
    it('should call next()', () => {
      let Controller = require('../controllers/_controller');
      class TestController extends Controller {
        configRouter() {}
      }

      let req = {};
      let res = {};
      let next = sinon.stub();
      let user = null;

      let c = new TestController({}, {}, {});
      c.authorize(req, res, next, user);

      assert(next.called);
    })
  })
});