function setupGrid(prefix, defaults) {
  if (!defaults)
    defaults = {};
  
  function getHash() {
    return _.mapValues(_.keyBy(_.map(_.filter(location.hash.split('&'), function (s) {
      return s.indexOf('=') >= 0;
    }), function (s) {
      if (s.indexOf('#') === 0)
        s = s.substring(1);
      var pair = s.split('=');
      return { key: pair[0], value: pair[1] }
    }), function (s) {
      return s.key;
    }), function (s) {
      return s.value;
    });
  }

  function setHash(hash) {
    location.hash = _.map(_.toPairs(hash), function (s) {
      return s[0] + '=' + s[1];
    }).join('&');
  }

  return $.ajax( '/grid/grid.html', {
    cache: false
  }).then(function (template) {
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

          var term = encodeURIComponent(this.get('p.term'));
          var sort = encodeURIComponent(this.get('p.sort.column'));
          var desc = this.get('p.sort.desc');

          setHash({
            sort: sort,
            desc: desc,
            term: term
          });
        }
      }
    });
    Ractive.components.grid = grid;

    var ractive = new Ractive({
      target: '#target',
      template: '#template',
      data: {}
    });

    function load() {
      var hash = getHash();

      hash = _.merge({
        start: 0,
        length: 10,
        sort: '_id',
        desc: false,
        term: null
      }, defaults, hash);

      api.list(prefix, hash.start, hash.length, hash.sort, hash.desc, hash.term).then(function (p) {
        ractive.set('p', p);
      });
    }

    load();

    window.onhashchange = function (e) {
      load();
    }
  });
}

