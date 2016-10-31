module.exports = containerLabels;

function containerLabels(paths, polyText) {
  var pathIdToTextLayout = Object.create(null);
  var queue = [];
  var queueTimer;
  var itemsPerCall = 90;

  paths.forEach(function(record) {
    var getTextLayout = polyText.getTextLayoutForPath(record.path);
    pathIdToTextLayout[record.id] = getTextLayout;
  });

  return {
    computeLayout: computeLayout
  }

  function computeLayout(pathId, text, layoutReadyCallback) {
    queue.push({
      pathId: pathId,
      text: text,
      callback: layoutReadyCallback
    });
    processQueue();
  }

  function processQueue() {
    if (queueTimer || queue.length === 0) return; // already running

    queueTimer = setTimeout(popItemFromQueue, 0);
  }

  function popItemFromQueue() {
    var i = 0;
    while (i < itemsPerCall && queue.length > 0) {
      var item = queue.shift();
      processQueItem(item);
      i++;
    }

    queueTimer = 0;
    processQueue();
  }

  function processQueItem(item) {
    var getTextLayout = pathIdToTextLayout[item.pathId];

    var textLayout = getTextLayout(item.text);
    if (!textLayout) return;

    item.callback(textLayout);
  }
}
