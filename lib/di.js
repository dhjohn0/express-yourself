let Promise = require('bluebird');

let getParameters = (func) => {
  var fnText = func.toString();

  var FN_ARGS        = /^(?:function\s*[^\(]*\(\s*([^\)]*)\))|(?:\(([^\)]*)\)\s*\=\>)/m,
      FN_ARG_SPLIT   = /,/,
      FN_ARG         = /^\s*(_?)(\S+?)\1\s*$/,
      STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

  var params = [];
  var argDecl = fnText.replace(STRIP_COMMENTS, '').match(FN_ARGS);
  var argString = typeof argDecl[1] === 'string' ? argDecl[1] : argDecl[2];
  argString.split(FN_ARG_SPLIT).forEach(function(arg) {
    arg.replace(FN_ARG, function(all, underscore, name) {
      params.push(name);
    });
  });

  return params;
};

module.exports = (app) => {
  let di = require('express-dinja')(app);
  di.pResolve = Promise.promisify(di.resolve);

  di.value = (name, value) => {
    di(name, function (req, res, next) {
      next(null, value);
    });
    return di;
  };

  di.invoke = (func) => {
    return Promise.all(getParameters(func).map((param) => {
      return di.pResolve(param);
    })).then((params) => {
      console.log(params);
      return func(...params)
    });
  };

  app.di = di;
  
  return di;
}