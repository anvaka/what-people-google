module.exports = getQuestions;

function getQuestions(dataSet) {
  var stateNameToRecord = buildIndex();

  return {
    getTextByStateName: getTextByStateName,
    getRecord: getRecord,
    extractText: extractText,
    getQueryHtml: getQueryHtml
  }

  function getRecord(stateName) {
    var record = stateNameToRecord[stateName];
    if (!record) throw new Error('State is not found: ' + stateName);
    return record;
  }

  function buildIndex() {
    var lookup = {};
    dataSet.forEach(function(x) {
      lookup[x.state] = x;
    });
    return lookup;
  }

  function getQueryHtml(record) {
    return 'why is <span class="query">' + record.state + '</span> ... ?';
  }

  function getTextByStateName(stateName, idx) {
    idx = idx || 0;

    var record = getRecord(stateName);
    var suggestionsCount = record.suggestions.length;
    if (idx >= suggestionsCount) {
      idx = idx % suggestionsCount;
    }

    return extractText(record.suggestions[idx]);
  }

  function extractText(suggestion) {
    var content = ''
    suggestion.replace(/<b>(.+?)<\/b>/g, function(_, what) {
      content += what;
    });

    return content.replace(/^\s|\s$/g, '');
  }
}
