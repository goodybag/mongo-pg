var
  MongoSql  = require('mongo-sql')
, db        = require('./lib/connection')
;

module.exports.init = function(config){
  db.init(config);

  for (var i = 0, l = config.collections.length; i < l; ++i){
    module.exports[key] = new MongoPg(config.collections[i]);
  }
};