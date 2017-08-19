module.exports = {
  _id: '_design/emailTemplates',
  language: 'javascript',

  views: {
    all: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'email-template')
          return;

        emit(doc._id, null);
      }
    },
    byName: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'email-template' || !doc.name)
          return;

        emit(doc.name, null);
      }
    },
    forList: {
      map: function (doc) {
        if (!doc || !doc.type || doc.type !== 'email-template') 
          return;
        for (var key in doc) {
          emit([key , doc[key]], null);
        }
      }
    }
  }
}