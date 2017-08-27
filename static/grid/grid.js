$.ajax( '/grid/grid.html', {
  async: false,
  success: function (template) {
    var grid = Ractive.extend({
      template: template,
      css: 
        '@media (max-width: 383px) { .grid-xxs-block { width: 100%; margin-bottom: 5px; } }' + 
        '.grid-spacer { padding-right: 10px } @media (max-width: 383px) { .grid-spacer { display: none; } }',
      data: {
        runTemplate: function(obj, t) {
          var r = new Ractive({
            delimiters: ['<%','%>'],
            data: obj,
            template: t
          });
          return r.toHTML();
        }
      },
      on: {
        search: function (e) {
          e.event.preventDefault();

          var term = this.get('term');
          location.href = location.pathname + '?term=' + encodeURIComponent(term)
        }
      }
    });

    Ractive.components.grid = grid;
  }
});

