let assert = require('assert');
let sinon = require('sinon');
let mrequire = require('mock-require');

describe('lib/logging', () => {
  describe('#(config)', () => {
    it('should not load any log types on empty config', () => {
      let winston = {
        add: sinon.stub(),
        remove: sinon.stub(),
        transports: {
          Console: 0,
          File: 1
        }
      };
      mrequire('winston', winston);

      let log = require('../lib/logging')({});

      assert(winston.remove.calledOnce);
      assert(winston.remove.calledWith(winston.transports.Console));
      assert(winston.add.notCalled);
    });

    it('should load Console when config.logging.console === true', () => {
      let winston = {
        add: sinon.stub(),
        remove: sinon.stub(),
        transports: {
          Console: 0,
          File: 1
        }
      };
      mrequire('winston', winston);

      let log = require('../lib/logging')({
        logging: {
          console: true
        }
      });

      assert(winston.add.notCalled);
      assert(winston.remove.notCalled);
    });

    it('should load Console with given options config.logging.console is an object', () => {
      let winston = {
        add: sinon.stub(),
        remove: sinon.stub(),
        transports: {
          Console: 0,
          File: 1
        }
      };
      mrequire('winston', winston);
      
      let config = {
        logging: {
          console: { testOption: 'foobar' }
        }
      };
      let log = require('../lib/logging')(config);

      assert(winston.remove.calledOnce);
      assert(winston.remove.calledWith(winston.transports.Console));
      assert(winston.add.calledOnce);
      assert(winston.add.calledWith(winston.transports.Console, config.logging.console));
    });

    it('should load File with given filename when config.logging.file is a string', () => {
      let winston = {
        add: sinon.stub(),
        remove: sinon.stub(),
        transports: {
          Console: 0,
          File: 1
        }
      };
      mrequire('winston', winston);

      let log = require('../lib/logging')({
        logging: {
          file: '/tmp/log'
        }
      });


      assert(winston.remove.calledOnce);
      assert(winston.remove.calledWith(winston.transports.Console));
      assert(winston.add.calledOnce);
      assert(winston.add.calledWith(winston.transports.File), { filename: '/tmp/log' });
    });

    it('should load File with given options when config.logging.file is an object', () => {
      let winston = {
        add: sinon.stub(),
        remove: sinon.stub(),
        transports: {
          Console: 0,
          File: 1
        }
      };
      mrequire('winston', winston);
      
      let config = {
        logging: {
          file: { testOption: 'foobar' }
        }
      };
      let log = require('../lib/logging')(config);

      assert(winston.remove.calledOnce);
      assert(winston.remove.calledWith(winston.transports.Console));
      assert(winston.add.calledOnce);
      assert(winston.add.calledWith(winston.transports.File, config.logging.file));
    });

    it('should load Couchdb with given db settings when config.logging.couchdb is true', () => {
      let winston = {
        add: sinon.stub(),
        remove: sinon.stub(),
        transports: {
          Console: 0,
          File: 1
        }
      };
      let couchdbWinston = {
        Couchdb: 2
      };
      mrequire('winston', winston);
      mrequire('winston-couchdb', couchdbWinston);

      let config = {
        logging: {
          couchdb: true
        },
        db: {
          name: 'http://localhost:5984'
        }
      };
      let log = require('../lib/logging')(config);


      assert(winston.remove.calledOnce);
      assert(winston.remove.calledWith(winston.transports.Console));
      assert(winston.add.calledOnce);
      assert(winston.add.calledWith(couchdbWinston.Couchdb), config.db);
    });

    it('should load Couchdb with given options when config.logging.couchdb is an object', () => {
      let winston = {
        add: sinon.stub(),
        remove: sinon.stub(),
        transports: {
          Console: 0,
          File: 1
        }
      };
      let couchdbWinston = {
        Couchdb: 2
      };
      mrequire('winston', winston);
      mrequire('winston-couchdb', couchdbWinston);

      let config = {
        logging: {
          couchdb: {
            name: 'http://localhost:5984'
          }
        }
      };
      let log = require('../lib/logging')(config);


      assert(winston.remove.calledOnce);
      assert(winston.remove.calledWith(winston.transports.Console));
      assert(winston.add.calledOnce);
      assert(winston.add.calledWith(couchdbWinston.Couchdb), config.logging.couchdb);
    });
  });
});