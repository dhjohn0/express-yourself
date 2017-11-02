let path = require('path');
let _ = require('lodash');
let Promise = require('bluebird');

let doWalk = require('./helpers/doWalk');

module.exports = (app, di, log, config) => {
  let ids = {};

  let cb = (c) => {
    let middleware = require(c);
    
    app.use((req, res, next) => {
      try{
        di.invoke(middleware, null, {
          req, res, next
        });
      }catch(err) {
        log.error(err);
        res.status(500);
        return res.send(
`<html lang="en"><head><meta charset="utf-8"><title>Error</title></head>
<body><pre>${err.stack ? err.stack.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/ /g, '&nbsp;').replace(/\n/g, '<br/>') : ''}</pre>
</body></html>`
        );
      };
    });
  }

  let localPath = path.join(__dirname, '../', 'middlewares');
  doWalk(config.paths.middlewares, cb, '.js');
  if (localPath !== config.paths.middlewares)
    doWalk(localPath, cb, '.js');
}