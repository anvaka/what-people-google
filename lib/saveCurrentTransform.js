module.exports = saveCurrentTransform;

var lastRequest = 0;
var saveDelay = 200; // Don't want to spam with history updates

function saveCurrentTransform(transform, queryState) {
  if (lastRequest) {
    clearTimeout(lastRequest);
  }

  lastRequest = setTimeout(function() {
    queryState.setValue({
      x: round(transform.x),
      y: round(transform.y),
      w: window.innerWidth,
      h: window.innerHeight,
      scale: round(transform.scale),
    });
  }, saveDelay);
}

function round(x) {
  return Math.round(x * 1000)/1000; 
}
