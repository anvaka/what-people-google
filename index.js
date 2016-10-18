var usa = require('./lib/usModel.js');
var queries = require('./lib/queries.js');

var createMap = require('./view/createMap.js');

var query = queries.getQuery('why-is');

var autoSuggestList = require('./view/createAutoSuggestList.js')(el('.questions-container'));

require('./view/createDropDownQuestions.js')(
  el('.input-question'),
  getPrecomputedQueries(),
  onNewQuerySelected
);

var map = createMap(usa, {
  getLabel: function(stateName) {
    return query.getAutoCompleteTextForState(stateName);
  },
  onStateSelected: function(stateName) {
    if (stateName) {
      var suggestions = query.getAllSuggestionsForState(stateName);
      autoSuggestList.show(suggestions);
    } else {
      autoSuggestList.hide();
    }
  }
});

function onNewQuerySelected(queryId) {
  map.reset();

  query = queries.getQuery(queryId);
  map.refreshLabels();
}

function el(selector) {
  return document.querySelector(selector)
}

function getPrecomputedQueries() {
  // Since Google Autocomplete API is not officially supported, we render only
  // set of pre-computed queries.
  var precomputedQueries = queries.listQueries();

  // TODO: this side effect needs to go. Ideally we want to read selected query from
  // the query string.
  precomputedQueries[0].selected = true;
  return precomputedQueries;
}

