let Promise = require('bluebird');
let fnArgs = require('fn-args');

let dict = {};

module.exports = () => {
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
          log.debug(`Unknown dependency: '${name}'`);
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

  return di;
};
