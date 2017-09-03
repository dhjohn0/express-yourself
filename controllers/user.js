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
      let user = await db.get(req.params.id);

      if (req.query.token === user.confirmationToken) {
        delete user.confirmationToken;
        user.confirmed = true;

        await db.put(user);
        req.flash('info', 'Email Confirmed');

        return res.redirect('/');
      }
    }

    return await super.show(req, res, db);
  }

  async create(req, res, db, mailer, config, _) {
    let user = req.body;

    let users = await db.query('user/byEmail', { 
      key: user.email,
      include_docs: true 
    });

    if (users.rows.length) {
      req.flash('error', 'Given email is already in use by another account');
      return res.redirect('/user/add');
    }else{
      user._id = uuid();

      let userPassword = {
        _id: uuid(),
        userId: user._id,
        password: bcrypt.hashSync(user.password),
        type: 'user-pass'
      };
      await db.put(userPassword);

      delete user.password;
      user.enabled = true;
      user.provider = 'local';

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

    let thisUser = await db.get(req.params.id);

    if (thisUser.provider !== 'local') {
      if (!req.accepts('text/html')) {
        return res.json({
          success: false,
          message: `Cannot update '${thisUser.email}'. User is managed by ${thisUser.provider}`
        });
      }else{
        req.flash('error', `Cannot update '${thisUser.email}'. User is managed by ${thisUser.provider}`);
        return res.redirect(`/user/${thisUser._id}/edit`);
      }
    }

    if (req.files) {
      let file = _.find(req.files, { fieldname: 'file' });
      if (!file || !thisUser) {
        req.flash('error', 'Could not upload file. Please try again');
        return res.redirect(`/upload?url=%2Fuser%2F${req.params.id}%3F_method%3DPUT`);
      }else{
        let name = file.originalname;
        let path = file.path;
        let mime = file.mimetype;

        let buffer = await fs.readFileAsync(path);

        if (thisUser.photo)
          delete thisUser._attachments[thisUser.photo];
        thisUser.photo = name;
        let updateUserResult = await db.put(thisUser);

        let response = await db.putAttachment(thisUser._id, name, updateUserResult.rev, buffer, mime);

        return res.send(`
          <html>
            <body>
              <script>
                window.parent.updatePhoto('${name}');
                window.location = '/upload?url=%2Fuser%2F${req.params.id}%3F_method%3DPUT';
              </script>
            </body>
          </html>
        `);
      }
    }else{
      user.email = thisUser.email;

      if (user.password) {
        let userPassword;

        let _userPass = await db.query('user/userPassword', { key: user._id, include_docs: true });
        if (_userPass.rows.length) {
          userPassword = _userPass.rows[0].doc;
        }else{
           userPassword = {
            _id: uuid(),
            userId: user._id,
            type: 'user-pass'
          };
        }
        userPassword.password = bcrypt.hashSync(user.password);
        await db.put(userPassword);
      }
      delete user.password;

      return super.update(req, res, db, _);
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

  async action(req, res, db, _) {
    if (req.body.action === 'Delete') {
      let ids = Array.isArray(req.body._id) || !req.body._id ? req.body._id : [ req.body._id ];
    
      if (ids && ids.length) {
        let _passes = await db.query('user/userPassword', { 
          keys: ids, 
          include_docs: true 
        });

        let passes = _passes.rows.map(r => {
          r.doc._deleted = true;
          return r.doc;
        });

        await db.bulkDocs(passes);
      }
    }
    return super.action(req, res, db, _);
  }
};
