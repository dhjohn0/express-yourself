
function ractiveCheckYourself(options) {
  return Ractive.extend({
    oninit: function () {
      var validator = new CheckYourself(options);
      var ractive = this;

      ractive.observe('*', function (newVal, oldVal, path) {
        if (path.indexOf('errors') === 0)
          return;
        if (typeof(oldVal) === 'undefined')
          return;
        var obj = {};
        obj[path] = newVal;
        var fullObj = ractive.get();
        var result = validator.check(obj, fullObj);

        var errors = _.merge(ractive.get('errors'), result.errors);
        if (!_.find(errors, function (val) { return !!val; }))
          errors = null;
        ractive.set('errors', errors);
      });

      ractive.on('check', function (e, field) {
        var obj = {};
        obj[field] = ractive.get(field);
        var fullObj = ractive.get();
        var result = validator.check(obj, fullObj);

        var errors = _.merge(ractive.get('errors'), result.errors);
        if (!_.find(errors, function (val) { return !!val; }))
          errors = null;
        ractive.set('errors', errors);
      })

      ractive.on('submit', function (e) {
        var obj = ractive.get();
        obj = _.omit(obj, 'errors');

        var result = validator.check(obj);
        if (result.failed) {
          ractive.set('errors', result.errors);
          e.event.preventDefault();
        }else{
          ractive.set('errors', null);
          ractive.fire('submit-passed', e);
        }
      });
    }
  });
  
}