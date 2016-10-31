module.exports = containerLabels;

function containerLabels(paths, polyText) {
  var pathIdToTextLayout = Object.create(null);

  paths.forEach(function(record) {
    var getTextLayout = polyText.getTextLayoutForPath(record.path);
    pathIdToTextLayout[record.id] = getTextLayout;
  });

  return {
    computeLayout: computeLayout
  }

  function computeLayout(pathId, text, layoutReadyCallback) {
    var getTextLayout = pathIdToTextLayout[pathId];

    var textLayout = getTextLayout(text);
    if (!textLayout) return;

    layoutReadyCallback(textLayout);
  }
}
