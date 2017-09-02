let elasticsearch = require('elasticsearch');

module.exports = async (config, db, log) => {
  if (!config.search)
    return undefined;

  let search = new elasticsearch.Client(config.search);

  //Set text feilds to sortable in elasticsearch
  await search.putTemplate({
    id: 'indexing-template',
    body: {
      "template": "*",
      "mappings": {
        "_default_": {
          "dynamic_templates": [
            {
              "strings2": {
                "match_mapping_type": "string",
                "mapping": {
                  "type": "text",
                  "fielddata": true
                }
              }
            }
          ]
        }
      }
    }
  }).catch(err => {
    log.error(err);
  });

  //Listen for couchdb changes, and updte elasticsearch
  db.changes({
    include_docs: true,
    return_docs: false,
    live: true,
    since: 'now'
  }).on('change', (change) => {
    if (!change || !change.id || !change.doc)
      return;
    if (change.doc.resource === 'log')
      return;
    if (change.id.indexOf('_design/') === 0)
      return;

    if (change.deleted) {
      search.exists({
        index: config.search.index,
        type: '_all',
        id: change.id
      }).then((exists) => {
        if (exists)
          return search.get({
            index: config.search.index,
            type: '_all',
            id: change.id
          });
        return null;
      }).then((eDoc) => {
        if (eDoc) {
          log.debug(`Deleting from elasticsearch: ${change.id}`);
          return search.delete({
            index: config.search.index,
            type: eDoc._type,
            id: change.id
          });
        }else{
          log.warn(`Cannot find document in elasticsearch to delete: ${change.id}`);
        }
      }).catch(err => {
        log.error(err);
      });
      
    }else if (change.doc.type) {
      log.debug(`Indexing into elasticsearch: ${JSON.stringify(change.doc)}`);

      delete change.doc._id;
      delete change.doc._rev;
      delete change.doc._attachments;

      search.index({
        index: config.search.index,
        type: change.doc.type,
        id: change.id,
        body: {
          [change.doc.type]: change.doc
        }
      }).catch((err) => {
        log.error(err)
      });
    }
  });

  return search;
}