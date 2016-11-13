// This is the main entry point to the site. I hope you enjoy reading and improving this code!
//
// Happy reading :)!
var loadData = require('./lib/loadData.js');
var createSideMenu = require('./view/createSideMenu.js');
var queryState = require('./lib/queryString.js')();

var lastMapName = getCurrentMapName();
var currentMap;

loadData(queryState, showMap);

queryState.on('changed', updateCurrentMap);

// TODO: this should be moved to 'load data'
var mapNameToViewFunction = {
  world: require('./view/createWorldMap.js'),
  usa: require('./view/createUSAMap.js')
}

function updateCurrentMap() {
  var newName = getCurrentMapName();
  if (lastMapName !== newName) {
    currentMap.unload();
    lastMapName = newName
    loadData(queryState, showMap);
  }
}

function showMap(mapData, queries) {
  // show "why-is" question by default.
  var defaultQuery = 'why-is';
  var selectedQuery = queryState.getValue('q') || defaultQuery;
  var query = queries.getQuery(selectedQuery, defaultQuery);
  createSideMenu(document.body);

  // construct all UI elements (we don't need any dom-view layer library, it's a simple project)

  // This component renders top suggestions user clicks on a state.
  var autoSuggestList = require('./view/createAutoSuggestList.js')(el('.questions-container'));

  // drop down that pretends to be an input box.
  require('./view/createDropDownQuestions.js')(
    el('.input-question'),
    getPrecomputedQueries(),
    onNewQuerySelected
  );

  // This component renders map
  currentMap = mapNameToViewFunction[getCurrentMapName()](mapData, {
    // method called to render a label on top of a state.
    getLabel: function(stateName) {
      return query.getAutoCompleteTextForState(stateName);
    },
    // method called when user clicks/taps on a state.
    onStateSelected: function(stateName) {
      if (stateName) {
        var suggestions = query.getAllSuggestionsForState(stateName);
        autoSuggestList.show(suggestions);
      } else {
        autoSuggestList.hide();
      }
    }
  });

  // this is called when user clicks on a different question.
  function onNewQuerySelected(queryId) {
    // Let's clean everything that was selected before
    currentMap.reset();
    queryState.setValue('q', queryId);

    // update data base and re-render labels.
    query = queries.getQuery(queryId);
    currentMap.refreshLabels();
  }

  // just a shortcut for `document.querySelector()`.
  function el(selector) {
    return document.querySelector(selector)
  }

  // Since Google Autocomplete API is not officially supported, we render only
  // set of pre-computed queries.
  function getPrecomputedQueries() {
    return queries.listQueries(selectedQuery);
  }
}

function getCurrentMapName() {
  return queryState.getValue('map') || 'world';
}
