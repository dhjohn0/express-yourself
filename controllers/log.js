let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');
let Promise = require('bluebird');

let RestfulController = require('./_restful-controller');

module.exports = class UserController extends RestfulController {
  get prefix() { return '/log'; }

  authorize(req, res, user, next) {
    if (user && user.roles && user.roles.admin)
      return next();

    return res.render('error', {
      header: '401: Unauthorized'
    });
  }

  async list(req, res, db) {
    let start = parseInt(req.query.start) || 0;
    let length = parseInt(req.query.length) || 20;

    if (req.headers && req.headers['accept'] && req.headers['accept'].toLowerCase().indexOf('application/json') >= 0) {
      let p = await db.paginate('Logs/byTimestamp', start, length, {
        descending: true
      });

      return res.json({
        list: p.list,
        pagination: p.pagination
      });
    }

    return res.render('log/list', {
      query: {
        start,
        length
      }
    });
  }
};
