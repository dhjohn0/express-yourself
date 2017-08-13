$.ajax( '/grid/grid.html', {
  async: false,
  success: function (template) {
    Ractive.components.grid = Ractive.extend({
      template: template,
      data: {
        runTemplate: function(obj, t) {
          var r = new Ractive({
            delimiters: ['<%','%>'],
            data: obj,
            template: t
          });
          return r.toHTML();
        }
      }
    });
  }
});

