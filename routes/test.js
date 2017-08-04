module.exports = (app, options) => {
  app.get('/', function (_, req, res) {
    //console.log(_)
    let a = [1, 2, 3];
    a = _.map(a, (v) => v + 1);
    res.send(a);
  });

  app.get('/users', function (req, res, db) {
    return db.query('users/all', { include_docs: true }).then((_users) => {
      let users = _users.rows.map(r => r.doc);
      res.send(JSON.stringify(users, null, ' '));
    });
  });
}