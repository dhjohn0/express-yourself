module.exports = {
  _id: '_design/users',
  language: 'javascript',

  views: {
    all: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'user')
          return;

        emit(doc._id, null);
      }
    },
    byEmail: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'user' || !doc.email)
          return;

        emit(doc.email, null);
      }
    },
    forList: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'user') 
          return;
        for (var key in doc) {
          emit([key , doc[key]], null);
        }
      }
    }
  }
}