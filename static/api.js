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
    list: function (prefix, start, length, sort, descending) {
      return ajax('GET', prefix + '/list?start=' + start + '&length=' + length + '&sort=' + sort + '&desc=' + (descending ? 'true' : 'false'));
    },
    get: function (prefix, id) {
      return ajax('GET', prefix + '/' + id);
    }
  };
})(window);