let path = require('path');

let assert = require('assert');

describe('lib/config', () => {
  describe('#(appDirectory, config)', () => {
    it('should return default config when passed empty args', () => {
      let config = require('../lib/config')();

      assert.deepEqual(config, {
        develop: true,
        paths: {
          controllers: 'controllers',
          views: 'views',
          static: 'static',
          less: 'less',
          docs: 'docs',
          crons: 'crons',
          uploads: '/tmp'
        },
        db: {
          host: 'localhost',
          port: 5984,
          db: 'express-yourself',
          secure: false,
          name: "http://localhost:5984/express-yourself"
        },
        logins: {
          local: true,
          facebook: false
        },
        search: {
          host: 'http://localhost:9200',
          index: 'express-yourself'
        },
        logging: {
          console: { level: 'debug' },
          file: path.join('logs', 'log.txt'),
          couchdb: true
        },
        mailer: false,
        hostname: 'http://localhost:8080'
      });
    });

    it('should use passed in config values', () => {
      let config = require('../lib/config')('', {
        paths: {
          controllers: 'conts',
          views: 'viewDirectory',
          static: 'assets'
        }
      });

      assert.deepEqual(config.paths, {
        controllers: 'conts',
        views: 'viewDirectory',
        static: 'assets',
        less: 'less',
        docs: 'docs',
        crons: 'crons',
        uploads: '/tmp'
      });
    });

    it('should build paths when passed an appDirectory', () => {
      let config = require('../lib/config')(__dirname);

      assert.deepEqual(config.paths, {
        controllers: path.join(__dirname, 'controllers'),
        views: path.join(__dirname, 'views'),
        static: path.join(__dirname, 'static'),
        less: path.join(__dirname, 'less'),
        docs: path.join(__dirname, 'docs'),
        crons: path.join(__dirname, 'crons'),
        uploads: '/tmp'
      });

      assert.equal(config.logging.file, path.join(__dirname, 'logs', 'log.txt'));
    });

    it('should build db name', () => {
      let config = require('../lib/config')('', {
        db: {
          host: 'www.couchdb.com',
          port: 5984,
          db: 'test',
          secure: true
        }
      });

      assert.equal(config.db.name, 'https://www.couchdb.com:5984/test');
    });
  });
});