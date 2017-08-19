let nodemailer = require('nodemailer');
let Promise = require('bluebird');

module.exports = (config, db, handlebars, log) => {
  if (config.mailer) {
    let transporter = Promise.promisifyAll(nodemailer.createTransport(config.mailer));
    
    let mailer = {
      send: async (to, subject, body) => {
        try{
          if (!Array.isArray(to))
            to = to;
          let toString = to.join(',');

          let response = await transporter.sendMailAsync({
            //from: config.mailer.from,
            toString,
            subject,
            html: body
          });

          response.accepted.map((a) => {
            log.info(`Mail to '${a}' accepted. Subject: ${subject} | Body: ${body}`);
          })
          response.rejected.map((a) => {
            log.info(`Mail to '${a}' rejected. Subject: ${subject} | Body: ${body}`);
          })

          return {
            success: response.rejected.length === 0,
            failed: response.rejected
          };
        }catch (err) {
          log.error(err);
          return {
            success: false,
            failed: null,
            error: err
          };
        }
      },
      sendTemplate: async (to, templateName, obj) => {
        let _templates = await db.query('emailTemplates/byName', {
          key: templateName,
          include_docs: true
        });
        if (!_templates || !_templates.rows || !_templates.rows.length)
          return {
            success: false,
            failed: null,
            error: 'Template not found'
          };

        let template = _templates.rows[0].doc;
        template.subject = handlebars.compile(template.subject);
        template.body = handlebars.compile(template.body);

        return await mailer.send(to, template.subject(obj), template.body(obj));
      }
    }; 

    return mailer;
  }else{
    return {
      send: async (to, subject, body) => {
        return Promise.resolve({
          success: true,
          failed: []
        });
      },
      sendTemplate: async (to, template, obj) => {
        return Promise.resolve({
          success: true,
          failed: []
        });
      }
    }
  }
}