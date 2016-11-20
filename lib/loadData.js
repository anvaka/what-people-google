/* global d3 */
var endpoint = require('../config.js').endpoint;
var validateError = require('./validateError.js');
var getQueryFile = require('./getQueryFile.js');

var createMapModel = {
  usa: require('./usModel.js'),
  world: require('./worldModel.js')
}

module.exports = loadMap;

function loadMap(queryState, mapDownloadedCallback) {
  var mapname = queryState.get('map') || 'world';
  var queryFile = queryState.get('queryFile');

  var dataPath = endpoint + mapname + '/';
  var indexFile = dataPath + 'index.json';
  var mapFile = dataPath + 'map.json';
  var queries, mapData, allDataFiles;

  // First load list of all available dates
  d3.json(indexFile, processIndexFile);
  // In parallel get the topojson file for the map
  d3.json(mapFile, processMapFile);

  function processIndexFile(err, receivedDataFiles) {
    validateError(err, indexFile);

    allDataFiles = receivedDataFiles;

    if (!Array.isArray(allDataFiles)) throw new Error('Index file is not an array at ' + indexFile);

    allDataFiles.reverse();

    queryFile = getValidQueryFile(queryFile, allDataFiles);

    getQueryFile(mapname, queryFile, function(result) {
      queries = result;
      triggerDoneIfNeeded()
    });
  }

  function getValidQueryFile(queryFile, allFiles) {
    for (var i = 0; i < allFiles.length; ++i) {
      if (allFiles[i] === queryFile) return queryFile;
    }

    return allFiles[0];
  }



  function processMapFile(err, mapJSON) {
    validateError(err, mapFile)
    mapData = createMapModel[mapname](mapJSON);

    triggerDoneIfNeeded();
  }

  function triggerDoneIfNeeded() {
    if (mapData && queries) {
      mapDownloadedCallback({
        queryFile: queryFile,
        index: allDataFiles,
        mapData: mapData,
        queries: queries
      });
    }
  }
}
