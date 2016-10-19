// This is the main entry point to the site. I hope you enjoy reading and improving this code!
//
// Happy reading :)!
var loadData = require('./lib/loadData');
var queryString = require('./lib/queryString.js')();

loadData(queryString, showMap);

var createMap = require('./view/createMap.js');

function showMap(mapData, queries) {
  // show "why-is" question by default.
  var query = queries.getQuery('why-is');

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
  var map = createMap(mapData, {
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
    map.reset();

    // update data base and re-render labels.
    query = queries.getQuery(queryId);
    map.refreshLabels();
  }

  // just a shortcut for `document.querySelector()`.
  function el(selector) {
    return document.querySelector(selector)
  }

  // Since Google Autocomplete API is not officially supported, we render only
  // set of pre-computed queries.
  function getPrecomputedQueries() {
    var precomputedQueries = queries.listQueries();

    // TODO: this side effect needs to go. Ideally we want to read selected query from
    // the query string.
    precomputedQueries[0].selected = true;
    return precomputedQueries;
  }
}
