module.exports = getQuery;

function getQuery(queryString) {
  var query = Object.create(null);

  (queryString || window.location.search)
    .substring(1)
    .split('&')
    .forEach(function(queryRecord) {
      var pair = queryRecord.split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    });

  return query;
}
