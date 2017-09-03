let Promise = require('bluebird');
let less = Promise.promisifyAll(require('less'));
let fs = Promise.promisifyAll(require('fs'));
let path = require('path');

let Controller = require('./_controller');

module.exports = class SessionController extends Controller {

  cache(key, value) {
    if (!this.cacheObj)
      this.cacheObj = {};

    if (value !== undefined)
      this.cacheObj[key] = value;
    return this.cacheObj[key];
  }

  get get() {
    return {
      '/less/:filename': async (req, res, config) => {
        let output = this.cache(req.params.filename);
        if (!output) {
          this.log.debug(`Compiling less file '${req.params.filename}' to CSS`);
          let file = null;
          try{
            file = await fs.readFileAsync(path.join(config.paths.less, req.params.filename + '.less'), 'utf8');
          }catch(e) {
            if (e.code !== 'ENOENT')
              this.log.error(e);
            file = null;
          }
          if (!file) {
            try{
              file = await fs.readFileAsync(path.join(__dirname, '../', 'less', req.params.filename + '.less'), 'utf8');
            }catch(e) {
              if (e.code !== 'ENOENT')
                this.log.error(e);
              file = null;
            }
          }
          if (file === undefined || file === null) {
            res.status(404);
            return res.send('File not found');
          }
          let result = await less.renderAsync(file);
          output = this.cache(req.params.filename, result.css);
        }

        res.set('Content-Type', 'text/css; charset=utf-8');
        res.set('Content-Length', output.length);
        return res.send(output);
      }
    };
  }
}
