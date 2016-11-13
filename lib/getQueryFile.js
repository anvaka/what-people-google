/* global d3 */
/**
 * Downloads a query file
 */
module.exports = getQueryFile;

var endpoint = require('../config.js').endpoint;
var createQueries = require('./queries.js');

var validateError = require('./validateError.js');

function getQueryFile(mapName, queryFile, done) {
  var dataPath = endpoint + mapName + '/';
  var queryFile = dataPath + queryFile;

  d3.json(queryFile, processQueryFile);

  function processQueryFile(err, queriesJSON) {
    validateError(err, queryFile);

    var queries = createQueries(queriesJSON);

    done(queries);
  }
}
