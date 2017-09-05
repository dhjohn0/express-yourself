let assert = require('assert');
var sinon = require('sinon');

describe('lib/di', () => {
  let DependencyInjector = require('../lib/di');

  describe('#value(name, val)', () => {
    it('should add given name/value pair to dictonary as a value', () => {
      let di = new DependencyInjector();

      let testObj = { foo: 'foo' };
      di.value('testObj', testObj);

      assert(!!di.dict['testObj']);
      assert.strictEqual(di.dict['testObj'].x, testObj);
      assert.equal(di.dict['testObj'].type, 'value');
    });
  });

  describe('#factory(name, val)', () => {
    it('should add given name/function pair to dictonary as a factory', () => {
      let di = new DependencyInjector();

      let testFx = () => { return 'test'; };
      di.factory('testFx', testFx);

      assert(!!di.dict['testFx']);
      assert.strictEqual(di.dict['testFx'].x, testFx);
      assert.equal(di.dict['testFx'].type, 'factory');
    });
  });

  describe('#invoke(fx, context, hardcodedArgs)', () => {
    it('should call passed in function with named values', () => {
      let di = new DependencyInjector();

      let testObj = { foo: 'foo' };
      di.dict = {
        testObj: {
          type: 'value',
          x: testObj
        }
      }

      let passedArgs = [];
      let toInvoke = function (testObj) {
        passedArgs = Array.from(arguments);
      }
      di.invoke(toInvoke, null, {});

      assert.deepEqual(passedArgs, [testObj]);
    });

    it('should call passed in function with resolved factory function', () => {
      let di = new DependencyInjector();

      let testObj = { foo: 'foo' };
      di.dict = {
        testObj: {
          type: 'value',
          x: testObj
        },
        testFx: {
          type: 'factory',
          x: (testObj) => {
            return testObj.foo + 'bar';
          }
        }
      }

      let passedArgs = [];
      let toInvoke = function (testFx) {
        passedArgs = Array.from(arguments);
      }
      di.invoke(toInvoke, null, {});

      assert.deepEqual(passedArgs, ['foobar']);
    });

    it('should call passed in function with hardcoded values', () => {
      let di = new DependencyInjector();

      let hardcoded = {
        req: { params: { id: '0' } },
        res: { send: function () {} }
      }

      let passedArgs = [];
      let toInvoke = function (req, res) {
        passedArgs = Array.from(arguments);
      }
      di.invoke(toInvoke, null, hardcoded);

      assert.deepEqual(passedArgs, [hardcoded.req, hardcoded.res]);
    });

    it('should call passed in function with undefined for unknown dependencies', () => {
      let di = new DependencyInjector();

      let testObj = { foo: 'foo' };
      di.dict = {
        testObj: {
          type: 'value',
          x: testObj
        },
        testFx: {
          type: 'factory',
          x: (testObj) => {
            return testObj.foo + 'bar';
          }
        }
      }

      let passedArgs = [];
      let toInvoke = function (req) {
        passedArgs = Array.from(arguments);
      }
      di.invoke(toInvoke, null, {});

      assert.deepEqual(passedArgs, [undefined]);
    });

     it('should call passed in function with the correct this context', () => {
      let di = new DependencyInjector();

      let self = { testData: true };

      let passedThis = null;
      let toInvoke = function (req) {
        passedThis = this;
      }
      di.invoke(toInvoke, self, {});

      assert.strictEqual(passedThis, self);
    });
  });
});