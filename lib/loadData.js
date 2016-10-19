/* global d3 */
var endpoint = require('../config.js').endpoint;
var createQueries = require('./queries.js');
var createMapModel = require('./usModel.js');

module.exports = loadData;

function loadData(mapname, dataDownloaded) {
  var dataPath = endpoint + mapname + '/';
  var indexFile = dataPath + 'index.json';
  var mapFile = dataPath + 'map.json';
  var queries, mapData;

  d3.json(indexFile, processIndexFile);
  d3.json(mapFile, processMapFile);

  function processIndexFile(err, allDataFiles) {
    validateError(err, indexFile);

    if (!Array.isArray(allDataFiles)) throw new Error('Index file is not an array at ' + indexFile);

    // TODO: check for protocol/absolute url?
    var latestDataFile = allDataFiles[allDataFiles.length - 1];
    var queryFile = dataPath + latestDataFile;

    d3.json(queryFile, processQueryFile);

    function processQueryFile(err, queriesJSON) {
      validateError(err, queryFile);
      queries = createQueries(queriesJSON);

      triggerDoneIfNeeded();
    }
  }

  function processMapFile(err, mapJSON) {
    validateError(err, mapFile)
    mapData = createMapModel(mapJSON);

    triggerDoneIfNeeded();
  }

  function triggerDoneIfNeeded() {
    if (mapData && queries) {
      dataDownloaded(mapData, queries);
    }
  }
}

function validateError(err, fileName) {
    if (err) {
      var errMessage = 'failed to download ' + fileName;
      console.error(errMessage, err);
      throw new Error(errMessage);
    }
}
