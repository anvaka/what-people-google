module.exports = containerLabels;

var isTouchDevice = 'ontouchstart' in document.documentElement;

function containerLabels(paths, polyText) {
  var pathIdToTextLayout = Object.create(null);
  var queue = [];
  var queueTimer;
  // usually touch devices (like mobile phones) are slower, so we give rendering
  // thread more time to handle rendering, by splitting our work load in multiple
  // async chunks
  var itemsPerCall = isTouchDevice ? 4 : 24;

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
