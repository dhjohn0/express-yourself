let assert = require('assert');
let sinon = require('sinon');
let mrequire = require('mock-require');

let handlebarsFactory = () => {
  let mock = {
    registerHelper: sinon.stub(),
    helpers: {
      'content': sinon.stub()
    }
  };
  mock.registerHelper.withArgs(sinon.match(/^(replace)|(append)|(prepend)$/)).callsFake((title, fx) => {
    fx('testBlock', {});
  });
  mock.registerHelper.withArgs('raw').callsFake((title, fx) => {
    fx({
      fn: sinon.stub()
    });
  });
  mock.registerHelper.withArgs('json').callsFake((title, fx) => {
    fx();
  });

  return mock;
};

describe('lib/handlebars', () => {
  describe('#(config)', () => {
    it('should create replace helper', () => {
      let hMock = handlebarsFactory();
      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(hMock.registerHelper.calledWith('replace', sinon.match.any));
    });

    it('should create append helper', () => {
      let hMock = handlebarsFactory();
      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(hMock.registerHelper.getCall(1).calledWith('append', sinon.match.any));
    });

    it('should create prepend helper', () => {
      let hMock = handlebarsFactory();
      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(hMock.registerHelper.calledWith('prepend', sinon.match.any));
    });

    it('should create raw helper', () => {
      let hMock = handlebarsFactory();
      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(hMock.registerHelper.calledWith('raw', sinon.match.any));
    });

    it('should create json helper', () => {
      let hMock = handlebarsFactory();
      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(hMock.registerHelper.calledWith('json', sinon.match.any));
    });

    it('should create ifNull helper', () => {
      let hMock = handlebarsFactory();
      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(hMock.registerHelper.calledWith('ifNull', sinon.match.any));
    });
  });

  //TODO: Check helper inner calls

  describe('#helper["ifNull"]', () => {
    it('should stringify given object if object is not null or undefined', () => {
      let obj = { hi: 'hi' };
      let defaultObj = { isDefault: true };

      let hMock = handlebarsFactory();
      hMock.registerHelper.withArgs('ifNull').callsFake((title, fx) => {
        fx(obj, defaultObj);
      });

      sinon.spy(JSON, 'stringify');

      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(JSON.stringify.calledWith(obj));

      JSON.stringify.restore();
    });

    it('should stringify default object if object is null', () => {
      let defaultObj = { isDefault: true };

      let hMock = handlebarsFactory();
      hMock.registerHelper.withArgs('ifNull').callsFake((title, fx) => {
        fx(null, defaultObj);
      });

      sinon.spy(JSON, 'stringify');

      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(JSON.stringify.calledWith(defaultObj));
      
      JSON.stringify.restore();
    });

    it('should stringify default object if object is undefined', () => {
      let defaultObj = { isDefault: true };

      let hMock = handlebarsFactory();
      hMock.registerHelper.withArgs('ifNull').callsFake((title, fx) => {
        fx(undefined, defaultObj);
      });

      sinon.spy(JSON, 'stringify');

      mrequire('handlebars', hMock);
      mrequire('../lib/layouts', () => {});

      let handlebars = require('../lib/handlebars')({});

      assert(JSON.stringify.calledWith(defaultObj));
      
      JSON.stringify.restore();
    });
  });
});