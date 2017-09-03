let bcrypt = require('bcrypt-nodejs');
let uuid = require('uuid/v1');
let passport = require('passport');

let Controller = require('./_controller');

module.exports = class UploadController extends Controller {
  get get() {
    return {
      '/upload': (req, res) => {
        res.render('upload/index');
      },
      '/file/:docId/:fileId': async (req, res, db) => {
        let doc = await db.get(req.params.docId);
        if (!doc._attachments || !doc._attachments[req.params.fileId])
          throw new Exception('Cannot find file');

        let attachment = doc._attachments[req.params.fileId];
        let buffer = await db.getAttachment(req.params.docId, req.params.fileId);

        res.set('Content-Type', attachment.content_type);
        res.set('Content-Length', attachment.length);

        return res.send(buffer);
      }
    };
  }
}
