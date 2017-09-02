module.exports = {
  _id: '_design/user',
  language: 'javascript',

  views: {
    all: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'user')
          return;

        emit(doc._id, null);
      }
    },
    byUsername: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'user' || !doc.username)
          return;

        emit(doc.username, null);
      }
    },
    forList: {
      map: function (doc) {
        var flatten = function (obj, notFirst) {
          var newObj = {};

          if (Array.isArray(obj)) {
            obj.forEach(function (val, index) {
              var result = flatten(val, true);
              for (var k in v) {
                var v = result[k];
                newObj[notFirst ? '.' + index + k : index + k] = v;
              };
            });
          }else if (typeof(obj) === 'object') {
            for (var key in obj) {
              var val = obj[key];
              var result = flatten(val, true);
              for(k in result) {
                var v = result[k];
                newObj[notFirst ? '.' + key + k : key + k] = v;
              };
            };
          }else{
            if (!notFirst)
              return obj;
            newObj[''] = obj;
          }

          return newObj;
        };

        if (!doc || !doc.type || doc.type !== 'user') 
          return;

        var d = flatten(doc);

        for (var key in d) {
          emit([key , d[key]], null);
        }
      }
    },
    userPassword: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'user-pass') 
          return;
        if (!doc.userId || !doc.password)
          return;
        
        emit(doc.userId, doc.password);
      }
    }
  }
}