module.exports = queryState;

var eventify = require('ngraph.events');

function queryState() {
  window.addEventListener('hashchange', updateQuery, false);

  var query;

  var api = {
    getValue: getValue,
    setValue: setValue
  }

  eventify(api);

  updateQuery();

  return api;

  function getValue(keyName) {
    return query[keyName];
  }

  function setValue(keyName, value) {
    query[keyName] = value;
    updateHash();
  }

  function updateHash() {
    var hash = '#?' + objectToHash(query);
    if (window.history) {
      window.history.replaceState(undefined, undefined, hash);
    } else {
      window.location.replace(hash);
    }
  }

  function updateQuery() {
    var queryString  = (window.location.hash || '#?').substr(2);
    query = getQuery(queryString);
    api.fire('changed', query);
  }
}

function objectToHash(object) {
  return Object.keys(object).map(toPairs).join('&')

  function toPairs(key) {
    var value = object[key];
    var pair = encodeURIComponent(key);
    if (value !== undefined) pair += '=' + encodeURIComponent(value)

    return pair
  }
}


function getQuery(queryString) {
  var query = Object.create(null);

  queryString.split('&')
    .forEach(function(queryRecord) {
      if (!queryRecord) return;

      var pair = queryRecord.split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    });

  return query;
}
