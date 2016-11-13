// This is the main entry point to the site. I hope you enjoy reading and improving this code!
//
// Happy reading :)!
var loadMap = require('./lib/loadData.js');
var createSideMenu = require('./view/createSideMenu.js');
var queryState = require('./lib/queryState.js')();
var getQueryFile = require('./lib/getQueryFile.js');

var lastMapName = getCurrentMapName();
var currentMap;

loadMap(queryState, showMap);

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
    loadMap(queryState, showMap);
  }
}

function showMap(map) {
  var dropDownQuestions;
  var queries;
  var query;

  updateQueries(map.queries);


  createSideMenu(document.body);

  // construct all UI elements (we don't need any dom-view layer library, it's a simple project)

  // This component renders top suggestions user clicks on a state.
  var autoSuggestList = require('./view/createAutoSuggestList.js')(el('.questions-container'));


  require('./view/createDateSelector.js')(
    el('.date-selector'),
    map.index,
    map.queryFile,
    onNewDateSelected
  );

  // This component renders map
  currentMap = mapNameToViewFunction[getCurrentMapName()](map.mapData, {
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

    // update database and re-render labels.
    query = queries.getQuery(queryId);
    currentMap.refreshLabels();
  }


  function onNewDateSelected(date) {
    queryState.setValue('queryFile', date);
    currentMap.reset();

    getQueryFile(getCurrentMapName(), date, function(result) {
      updateQueries(result)
      currentMap.refreshLabels();
    })
  }

  function updateQueries(newQueries) {
    if (dropDownQuestions) {
      dropDownQuestions.dispose();
    }
    queries = newQueries;
    // show "why-is" question by default.
    var defaultQuery = 'why-is';
    var selectedQuery = queryState.getValue('q') || defaultQuery;
    query = queries.getQuery(selectedQuery, defaultQuery);

    // drop down that pretends to be an input box.
    dropDownQuestions = require('./view/createDropDownQuestions.js')(
      el('.input-question'),
      getPrecomputedQueries(),
      onNewQuerySelected
    );

    // Since Google Autocomplete API is not officially supported, we render only
    // set of pre-computed queries.
    function getPrecomputedQueries() {
      return queries.listQueries(selectedQuery);
    }
  }
}

function getCurrentMapName() {
  return queryState.getValue('map') || 'world';
}

// just a shortcut for `document.querySelector()`.
function el(selector) {
  return document.querySelector(selector)
}
