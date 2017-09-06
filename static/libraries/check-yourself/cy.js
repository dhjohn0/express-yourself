(function (def) {
  if (typeof module !== "undefined" && module && module.exports)
    def(true);
  else
    def(false);
})(function (isNode) {

  var _ = !isNode ? window._ : require('lodash');

  function CheckYourself(options) {
    this.options = options;

    _.each(options.fields, function (f) {
      if (!f.errorName)
        f.errorName = f.name.toString().replace(/[^\w\s]/gi, '', '');
    });
  }

  CheckYourself.prototype.defaultChecks = {
    'required': function (val) {
      return typeof(val) !== 'undefined' && val !== ''
    },
    'email' : function (val) {
      var at = val.indexOf('@');
      var dot = val.lastIndexOf('.');

      return at > 0 && dot > at && dot < val.length - 1;
    }
  };

  CheckYourself.prototype.flatten = function (obj, notFirst) {
    var self = this;

    var newObj = {};

    if (Array.isArray(obj)) {
      _.each(obj, function (val, index) {
        var result = self.flatten(val, true);
        _.forOwn(result, (v, k) => {
          newObj[notFirst ? '.' + index + k : index + k] = v;
        });
      });
    }else if (typeof(obj) === 'object') {
      _.forOwn(obj, function (val, key) {
        var result = self.flatten(val, true);
        _.forOwn(result, function (v, k) {
          newObj[notFirst ? '.' + key + k : key + k] = v;
        });
      });
    }else{
      if (!notFirst)
        return obj;
      newObj[''] = obj;
    }

    return newObj;
  };

  CheckYourself.prototype.runCheck = function (validator, val, key, obj, errors) {
    var self = this;

    var failed = false;
    if (!errors)
      errors = {};

    _.each(validator.checks, function (check) {
      var checkFunc;
      if (typeof(check.test) === 'string')
        checkFunc = self.defaultChecks[check.test];
      else if (check.test  instanceof RegExp)
        checkFunc = function (val) {
          return typeof(val) === 'string' && val.match(check.test);
        }
      else
        checkFunc = check.test;
      if (!checkFunc(val, key, obj)) {
        errors[validator.errorName] = check.message ? check.message : 'Test failed';
        failed = true;
        return false;
      }else{
        errors[validator.errorName] = null;
      }
    });

    return !failed;
  }

  CheckYourself.prototype.check = function (obj, fullObj) {
    var self = this;

    var checks = _.clone(self.options.fields);

    var list = self.flatten(obj);
    var errors = {};
    var failed = false;

    _.forOwn(list, function (val, key) {
      var validator = _.find(self.options.fields, function (f) {
        if (f.name instanceof RegExp) {
          return key.match(f.name);
        }
        return key === f.name;
      });

      if (!validator) {
        if (self.options.strict) {
          errors[key] = typeof(self.options.strict) === 'boolean' ? 'Field not listed in fields list' : options.strict;
          failed = true;
        }
        return;
      }
      if (!validator.checks)
        return;

      _.remove(checks, validator);

      if (!self.runCheck(validator, val, key, fullObj ? fullObj : obj, errors))
        failed = true;
    });

    if (!fullObj) {
      _.each(checks, function (validator) {
        if (!self.runCheck(validator, undefined, undefined, undefined, errors))
          failed = true;
      });
    }

    return {
      failed: failed,
      errors: errors
    };
  };
  if (isNode)
    module.exports = CheckYourself;
  else
    window.CheckYourself = CheckYourself;
});