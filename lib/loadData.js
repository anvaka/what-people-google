/* global d3 */
var endpoint = require('../config.js').endpoint;
var createQueries = require('./queries.js');
var createMapModel = {
  usa: require('./usModel.js'),
  world: require('./worldModel.js')
}

module.exports = loadData;

function loadData(options, dataDownloadedCallback) {
  var mapname = options.map || 'world';
  var queryFile = options.queryFile;

  var dataPath = endpoint + mapname + '/';
  var indexFile = dataPath + 'index.json';
  var mapFile = dataPath + 'map.json';
  var queries, mapData, allDataFiles;

  d3.json(indexFile, processIndexFile);

  if (queryFile) {
    getQueryFile(queryFile);
  }

  d3.json(mapFile, processMapFile);

  function processIndexFile(err, receivedDataFiles) {
    validateError(err, indexFile);
    allDataFiles = receivedDataFiles;

    if (!Array.isArray(allDataFiles)) throw new Error('Index file is not an array at ' + indexFile);

    if (!queryFile) {
      var latestDataFile = allDataFiles[allDataFiles.length - 1];
      getQueryFile(latestDataFile);
    }
  }

  function getQueryFile(fileName) {
    // TODO: check for protocol/absolute url?
    var queryFile = dataPath + fileName;

    d3.json(queryFile, processQueryFile);

    function processQueryFile(err, queriesJSON) {
      validateError(err, queryFile);

      queries = createQueries(queriesJSON);

      triggerDoneIfNeeded();
    }
  }


  function processMapFile(err, mapJSON) {
    validateError(err, mapFile)
    mapData = createMapModel[mapname](mapJSON);

    triggerDoneIfNeeded();
  }

  function triggerDoneIfNeeded() {
    if (mapData && queries) {
      dataDownloadedCallback(mapData, queries, allDataFiles);
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
