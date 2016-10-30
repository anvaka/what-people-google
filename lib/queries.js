/**
 * Provides a wrapper on top of raw JSON queries 
 */

module.exports = createQueries;

function createQueries(queriesDataSet) {
  return {
    /**
    * Given a query id returns API to work with query.
    */
    getQuery: getQuery,

    /**
    * Lists all available queries in the "database"
    */
    listQueries: listQueries
  };

  /**
   * Lists all available queries in the "database"
   */
  function listQueries(selectedKey) {
    return Object.keys(queriesDataSet).map(toQuery);

    function toQuery(key) {
      return {
        value: key,
        text: queriesDataSet[key].display,
        selected: key === selectedKey
      };
    }
  }

  /**
   * Given a query id returns API to work with query.
   */
  function getQuery(queryId, defaultQueryId) {
    var dataSet = queriesDataSet[queryId] || queriesDataSet[defaultQueryId];
    if (!dataSet) {
      throw new Error('Cannot find query with id ' + queryId);
    }

    // Since we will be accessing each search record by state name very often,
    // we build a look up index from state name to its search record. Each
    // search record contains auto suggestions from Google.
    var stateNameToRecord = buildIndex();

    var queryAPI = {
      getAutoCompleteTextForState: getAutoCompleteTextForState,
      getAllSuggestionsForState: getAllSuggestionsForState
    };

    return queryAPI;

    function getAllSuggestionsForState(stateName) {
      var searchRecord = getSearchRecord(stateName);
      return searchRecord.suggestions;
    }

    function getSearchRecord(stateName) {
      var record = stateNameToRecord[stateName];
      if (!record)
        throw new Error('State is not found: ' + stateName);
      return record;
    }

    function buildIndex() {
      var lookup = {};
      dataSet.records.forEach(function(x) {
        lookup[x.state] = x;
      });

      return lookup;
    }

    function getAutoCompleteTextForState(stateName) {
      var record = getSearchRecord(stateName);
      var suggestionsCount = record.suggestions.length;

      // It is okay, some questions have no answers from autocomplete.
      if (suggestionsCount === 0) return '';

      return extractText(record.suggestions[0]);
    }
  }
}

function extractText(suggestion) {
  return (suggestion || '').replace(/<\/?b>/g, '').replace(/^\s|\s$/g, '');
}
