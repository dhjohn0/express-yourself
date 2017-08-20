let Promise = require('bluebird');
let fnArgs = require('fn-args');

let dict = {};

module.exports = (app) => {
  let di = {
    value: (name, val) => {
      dict[name] = {
        type: 'value',
        x: val
      };
      return di;
    },
    factory: (name, fx) => {
      dict[name] = {
        type: 'factory',
        x: fx
      };
      return di;
    },
    invoke: (fx, context, hardcodedArgs) => {
      let args = fnArgs(fx);
      args = args.map((name) => {
        for (a in hardcodedArgs) {
          if (a === name)
            return hardcodedArgs[a];
        }

        let d = dict[name];
        if (!d)
          throw new Error(`Unknown dependency: '${name}'`);
        if (d.type === 'value')
          return d.x;
        else if (d.type === 'factory')
          return di.invoke(d.x, context, hardcodedArgs);
        else
          return undefined;
      });

      return fx.apply(context, args);
    }
  };

  app.di = di;
  return di;
};

// module.exports = (app) => {
//   let di = require('express-dinja')(app);
//   di.pResolve = Promise.promisify(di.resolve);

//   di.value = (name, value) => {
//     di(name, function (req, res, next) {
//       next(null, value);
//     });
//     return di;
//   };

//   di.invoke = (func) => {
//     return Promise.all(getParameters(func).map((param) => {
//       return di.pResolve(param);
//     })).then((params) => {
//       console.log(params);
//       return func(...params)
//     });
//   };

//   app.di = di;
  
//   return di;
// }