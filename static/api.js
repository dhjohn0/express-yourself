(function (window) {
  function ajax(method, url, body, callback) {

    return new Promise(function (resolve, reject) {

      var httpRequest;
      if (window.XMLHttpRequest)
        httpRequest = new XMLHttpRequest();
      else
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
      httpRequest.onreadystatechange = function () {

        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          var response = JSON.parse(httpRequest.responseText);
          if (httpRequest.status === 200) {
            if (callback)
              callback(null, response);
            return resolve(response);
          } else {
            if (callback)
              callback(response, null);
            return reject(response);
          }
        }
      }
      httpRequest.open(method.toUpperCase(), url);
      httpRequest.setRequestHeader('Content-Type', 'application/json');
      httpRequest.setRequestHeader('Accept', 'application/json');
      httpRequest.setRequestHeader('Cache-Control', 'no-cache');
      httpRequest.send(JSON.stringify(body));
    })
  }

  window.api = {
    list: function (prefix, start, length, sort, descending, searchTerm) {
      var q = '/list';
      q += '?start=' + start;
      q += '&length=' + length;
      q += '&sort=' + sort;
      q += '&desc=' + ((descending === true || descending === 'true') ? 'true' : 'false');
      if (searchTerm)
        q += '&term=' + searchTerm;

      return ajax('GET', prefix + q);
    },
    get: function (prefix, id, params) {
      var q = '';
      if (params) {
        q = '?' + _.map(_.toPairs(params), function (p) { return p[0] + '=' + p[1]; }).join('&');
      }
      return ajax('GET', prefix + '/' + id + q);
    },
    create: function (prefix, item) {
      return ajax('POST', prefix + '/', item);
    },
    update: function (prefix, item) {
      return ajax('PUT', prefix + '/' + item._id, item);
    },
    destroy: function (prefix, item) {
      return ajax('DELETE', prefix + '/' + item._id);
    },
    action: function (prefix, actionType, ids) {
      var body = {
        action: actionType,
        _id: ids
      };
      return ajax('POST', prefix + '/action', body);
    },
  };

  window.flash = function (type, message) {
    if (type === 'error')
      type = 'danger';
    $('#flash-container').append('<div class="alert alert-' + 
      type + 
      ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
      message + 
      '</div>');
  }
})(window);