var
  util          = require('util')
, pg            = require('pg')
, QueryBuilder  = require('mongo-sql')

, Collection = module.exports.Collection = function(collection, client){
    this.collection = collection;
    this.query = new QueryBuilder(collection);
    this.client = client;
  }
;

module.exports.init = function(options){
  var client = new pg.Client(options.connectionString);

  options.collections.forEach(function(collection){
    module.exports[collection] = new Collection(collection, client);
  });

  client.connect(function(error){ if (error) throw error; })
};

Collection.prototype.find = function($query, options, callback){
  if (typeof options == 'function'){
    callback = options;
    options = {};
  }

  if (!callback) options.defer = true;

  var result = this.query.find($query, options);

  if (!callback) return result;

  this.client.query(result.toString(), result.values, function(error, result){
    if (error) return callback(error);

    callback(null, result.rows, result);
  });
};

Collection.prototype.findOne = function($query, options, callback){
  if (typeof options == 'function'){
    callback = options;
    options = {};
  }

  if (!callback) options.defer = true;

  var result = this.query.findOne($query, options);

  if (!callback) return result;

  this.client.query(result.toString(), result.values, function(error, result){
    if (error) return callback(error);

    callback(null, result.rows.length > 0 ? result.rows[0] : null, result);
  });
};

Collection.prototype.insert = function($doc, options, callback){
  if (typeof options == 'function'){
    callback = options;
    options = {};
  }

  if (!callback) options.defer = true;

  var result = this.query.insert($doc, options);

  if (!callback) return result;

  console.log(result.toString(), result.values);

  this.client.query(result.toString(), result.values, function(error, result){
    if (error) return callback(error);

    callback(null, result.rows.length > 0 ? result.rows[0] : null, result);
  });
};

Collection.prototype.remove = function($query, options, callback){
  if (typeof options == 'function'){
    callback = options;
    options = {};
  }

  if (!callback) options.defer = true;

  var result = this.query.remove($query, options);

  if (!callback) return result;

  this.client.query(result.toString(), result.values, function(error, result){
    if (error) return callback(error);

    callback(null, result.rows, result);
  });
};

Collection.prototype.update = function($query, $doc, options, callback){
  if (typeof options == 'function'){
    callback = options;
    options = {};
  }

  if (!callback) options.defer = true;

  var result = this.query.update($query, $doc, options);

  if (!callback) return result;

  this.client.query(result.toString(), result.values, function(error, result){
    if (error) return callback(error);

    callback(null, result.rows, result);
  });
};