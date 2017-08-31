let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');
let Promise = require('bluebird');
let fs = Promise.promisifyAll(require('fs'));

let CrudController = require('./_crud-controller');

module.exports = class UserController extends CrudController {
  get prefix() { return '/user'; }

  get type() { return 'user'; }
  get userFriendlyName() { return 'User'; }

  get confirmEmail() { return false; }

  validationMiddleware(req, res, next) {
    if (req.files)
      return next();
    return super.validationMiddleware(req, res, next);
  }

  async show(req, res, db) {
    //Not quite Restful, but it needed to go in a GET method
    if (req.query.token) {
      if (req.query.token === user.confirmationToken) {
        delete user.confirmationToken;
        user.confirmed = true;

        await db.put(user);
        req.flash('info', 'Email Confirmed');

        return res.redirect('/');
      }
    }

    return super.show(req, res, db);
  }

  async create(req, res, db, mailer, config, _) {
    let user = req.body;

    let users = await db.query('user/byEmail', { 
      key: user.email,
      include_docs: true 
    });

    if (users.rows.length) {
      req.flash('error', 'Given email is already in use by another account');
      return res.redirect('/user/list');
    }else{
      user.password = bcrypt.hashSync(user.password);
      user.enabled = true;

      if (this.confirmEmail) {
        let url = req.get('host');
        if (url) {
          url = `${req.protocol}://${url}`;
        }else{
          url = config.hostname;
        }
        user.confirmationToken = uuid();
        let response = await mailer.sendTemplate(user.email, 'confirm-email', {
          user,
          confirmationLink: `${url}/user/${user._id}?token=${user.confirmationToken}`
        });
      }else{
        user.confirmed = true;
      }
      
      return await super.create(req, res, db, _);
    }
  }

  async update(req, res, db, _) {
    let user = req.body;

    if (req.files) {
      let thisUser = await db.get(req.params.id);
      let file = _.find(req.files, { fieldname: 'file' });
      if (!file || !thisUser) {
        req.flash('error', 'Could not upload file. Please try again');
      }else{
        let path = file.path;
        let mime = file.mimetype;

        let buffer = await fs.readFileAsync(path);

        await db.putAttachment(thisUser._id, 'photo', thisUser._rev, buffer, mime);
        req.flash('success', 'Photo Uploaded');
      }

      return res.redirect(`/upload?url=%2Fuser%2F${req.params.id}%3F_method%3DPUT`);
    }else{
      if (!user.password) {
        let dbUser = await db.get(user._id);
        user.password = dbUser.password;
      }

      super.update(req, res, db, _);
    }
  }

  actionChange(change, action) {
    switch (action) {
      case "Delete":
        change._deleted = true;
        return 'Users deleted';
      case "Enable":
        change.enabled = true;
        return 'Users enabled';
      case "Disable":
        change.enabled = false;
        return 'Users disabled';
    }
  }
};
