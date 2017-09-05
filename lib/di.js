let Promise = require('bluebird');
let fnArgs = require('fn-args');

module.exports = class DependencyInjector {
  constructor() {
    this.dict = {};
  }

  value(name, val) {
    this.dict[name] = {
      type: 'value',
      x: val
    };
    return this;
  }

  factory(name, fx) {
    this.dict[name] = {
      type: 'factory',
      x: fx
    };
    return this;
  }

  invoke(fx, context, hardcodedArgs) {
    let args = fnArgs(fx);
    args = args.map((name) => {
      for (let a in hardcodedArgs) {
        if (a === name)
          return hardcodedArgs[a];
      }

      let d = this.dict[name];
      if (d && d.type === 'value')
        return d.x;
      if (d && d.type === 'factory')
        return this.invoke(d.x, context, hardcodedArgs);
      return undefined;
    });

    return fx.apply(context, args);
  }
};
