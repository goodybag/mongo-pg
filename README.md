# MongoPG - A Mongo-like interface for Node Postgres

MongoPg allows you to create queries using documents or javascript objects. It provides a mostly declarative interface for writing sql. You can do stuff like this:

```javascript
db.users.findOne(27, function(error, result){
  if (error) return res.error(error);

  result.id == 27 // true;
});
```

Install via npm:

```
npm install mongo-sql
```

## Getting Started

You should use mongo-pg as your goto database module. Don't mess around with node-pg:

```javascript
var db = require('mongo-pg');

db.init({
  // Obviously your PG connection string as normal
  connectionString: 'postgres://localhost:5432/my-db'

  // Array of tables you want to interface with
, collections: [
    'users'
  , 'groups'
  , 'posts'
  ]
})
```

Node PG will queue up queries until a connection is established. So feel free to start using mongo-pg immediately after running the init function.

```javascript
// Users where id greater than 50
db.users.find({ id: { $gt: 50 } }, function(error, results){
  /* ... */
});
```

## Commands

Commands are the atomic unit of MongoPG and comprise the majority of the imperative behavior. On the inside, they're composed of strings that look like this:

```sql
-- find
'select {fields} from {collections} {joins} {where} {limit} {order} {groupBy}
```

Each variable, denoted with ```{...}``` corresponds to a sql builder. The builders evaluate the passed in objects to produce a sql string. Note that when $query is a number, it is converted to an object of the form: ```{ id: @input }```. The following Commands are available:

#### Find

collection.find - Find and return some documents

Various argument possibilities

* callback?
* $query, callback?,
* $query, fields, callback?
* $query, options, callback?

If ___$query___ is an object:

* $equals
* $lt, $lte
* $gt, $gte
* $null, $notNull
* $in, $nin


___options:___

* fields
* order
* offset
* limit
* groupBy
* joins
  - join
  - innerJoin
  - leftJoin
  - leftOuterJoin
  - fullOuterJoin
  - crossJoin

#### Find One

collection.findOne - Find and return one document

Various argument possibilities

* callback?
* $query, callback?,
* $query, fields, callback?
* $query, options, callback?

If ___$query___ is an object:

* $equals
* $lt, $lte
* $gt, $gte
* $null, $notNull
* $in, $nin


___options:___

* fields
* order
* offset
* limit
* groupBy
* joins
  - join
  - innerJoin
  - leftJoin
  - leftOuterJoin
  - fullOuterJoin
  - crossJoin

#### Delete

collection.delete - Remove documents

Various argument possibilities

* callback?
* $query, callback?,
* $query, callback?
* $query, callback?

If ___$query___ is an object:

* $equals
* $lt, $lte
* $gt, $gte
* $null, $notNull
* $in, $nin

#### Update

collection.update - Update documents

Various argument possibilities

* $query, $update, callback?,
* $query, $update, options, callback?

If ___$query___ is an object:

* $equals
* $lt, $lte
* $gt, $gte
* $null, $notNull
* $in, $nin

___$update:___

This is the update document: 

```javascript
{ name: 'Jack' }
```

Sets name = 'Jack'

___options:___

* fields
* order
* offset
* limit
* groupBy
* joins
  - join
  - innerJoin
  - leftJoin
  - leftOuterJoin
  - fullOuterJoin
  - crossJoin

Eventually, there will be custom command support. But for the time being, you'll have to get by with _Conditional and Value Helpers_.

## Helpers

All conditionals and value types are implemented as helpers. Things like ```$gt, $lt, $equals``` are all conditionals. They are helpers that construct the parts of queries that have conditions. Values are what's on the right-hand side of a condition. If you needed to do something like:

```sql
select * from users where last_visited > ( now() - interval '5' hour );
```

Then you could register a value helper to help format hate right-hand value in parenthesis.

```javascript
var db = require('mongo-pg');

// Optionally pass in an options object as the second parameter
db.registerHelper('$hours_ago', function(column, value, values, collection){
  return "now() - interval $" + values.push(value.value) + " hour";
});

db.users.find({
  'last_visited':
  { $gt: { $hours_ago: 5 } }
});
```

The ```$hours_ago``` (along with minutes, days, years, etc.) helper is already implemented in mongo-sql. I realize that I've introduced two conflicting conventions. Camel-case and underscores. I'll fix it soon.

All helpers, conditional or otherwise, are passed 4 arguments to their implementation function

```javascript
/**
 * Helper functions are passed
 * @param column      {String}  - Column name either table.column or column
 * @param value       {Mixed}   - What the column should be equal to
 * @param values      {Array}   - The values for the query
 * @param collection  {String}  - The main table for the query
 */
```

The value parameter can be anything. By default, if the query evaluation loop comes across a helper, it will chunk the value of the helper in the document to the function as the "value". However, if when registering the helper, you pass in:

```javascript
{ customValues: false }
```

Then the evaluation loop will assume you want the pre-parameterized value of the key. This is particularly useful for single-value or simple-value helpers like ```$gt``` or ```$equals```:

```javascript
db.registerConditionalHelper('$equals', { cascade: true, customValues: false }, function(column, value, values, collection){
  return column + ' = ' + value;
});

db.registerConditionalHelper('$gt', { cascade: true, customValues: false }, function(column, value, values, collection){
  return column + ' > ' + value;
});
```

#### Helper Cascading

By default, helpers do not cascade. But what is cascading? Cascading is useful for swapping the order in which you apply conditionals or values. For instance, when performing a greater than query, there are multiple ways to order it:

```javascript
db.users.find({ id: { $gt: 1 } });
db.users.find({ $gt: { id: 1 } });
```

The way you write depends on the query. In the above example, if you need to perform multiple conditions on ```id``` then it would be useful to write it the first way:

```javascript
db.users.find({ id: { $gt: 1, $lt: 100, $or: { $gt: 100 } } });
```

On the other hand, if you were performing greater than conditionals to multiple columns, it would be beneficial to write it the second way:

```javascript
db.users.find({ $gt: { id: 1, name: 'Tom', createdAt: { $months_ago: 1 } } });
```

Most of the default conditional helpers cascade and most (if not all) of the value helpers do not. Getting the cascade right is hard. So, when writing helpers, it _may be_ beneficial to not turn cascading on.

## Examples

TODO. For now, you can look at the (Mongo-SQL)[https://github.com/goodybag/mongo-sql] tests.