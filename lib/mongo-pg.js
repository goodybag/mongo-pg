var
  db = require('./connection')
, QueryBuilder = require('mongo-sql')

, MongoPg = function(collection){
    this.queryBuilder = new QueryBuilder(collection);
  }
;

MongoPg.prototype.findOne = function($query, options, callback){
  if (typeof options === "function"){
    callback = options;
    options = {};
  }

  var query = this.queryBuilder.findOne($query, options);

  if (!callback) return query;

  db.getClient(function(error, client){
    if (error) return callback(error);

    client.query(query, function(error, result){
      if (error) return callback(error);

      callback(null, result.rows && result.rows.length > 0 ? result.rows[0] : null);
    });
  });
};

MongoPg.prototype.find = function($query, options, callback){
  if (typeof options === "function"){
    callback = options;
    options = {};
  }

  if (!callback) options.defer = true;

  var query = this.queryBuilder.find($query, options);

  if (!callback) return query;

  db.getClient(function(error, client){
    if (error) return callback(error);

    client.query(query.toString(), query.values, function(error, result){
      if (error) return callback(error);

      callback(null, result.rows);
    });
  });
};

MongoPg.prototype.update = function($query, $update, options, callback){
  if (typeof options === "function"){
    callback = options;
    options = {};
  }

  var query = this.queryBuilder.update($query, $update, options);

  if (!callback) return query;

  db.getClient(function(error, client){
    if (error) return callback(error);

    client.query(query, function(error, result){
      if (error) return callback(error);

      callback(null, result.rows);
    });
  });
};

MongoPg.prototype.insert = function($document, options, callback){
  if (typeof options === "function"){
    callback = options;
    options = {};
  }

  var query = this.queryBuilder.insert($document, options);

  if (!callback) return query;

  db.getClient(function(error, client){
    if (error) return callback(error);

    client.query(query, function(error, result){
      if (error) return callback(error);

      callback(null, result.rows && result.rows.length > 0 ? result.rows[0] : null);
    });
  });
};

MongoPg.prototype.remove = function($query, options, callback){
  if (typeof options === "function"){
    callback = options;
    options = {};
  }

  var query = this.queryBuilder.remove($query, options);

  if (!callback) return query;

  db.getClient(function(error, client){
    if (error) return callback(error);

    client.query(query, function(error, result){
      if (error) return callback(error);

      callback(null, result.rows && result.rows.length > 0 ? result.rows[0] : null);
    });
  });
};

module.exports = MongoPg;