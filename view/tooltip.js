module.exports = makeTooltip;

function makeTooltip(container) {
  var lastText = '';
  var xPadding = 0;
  var yPadding = -40;

  return {
    show: show,
    hide: hide
  };

  function show(text, x, y) {
    if (text !== lastText) updateText(text);
    container.style.left = Math.max(0, (x + xPadding)) + 'px';
    container.style.top = Math.max(0, (y + yPadding)) + 'px';
    container.style.visibility = 'visible';
  }

  function hide() {
    container.style.visibility = 'hidden';
  }

  function updateText(text) {
    lastText = text;
    container.innerHTML = text;
    var size = container.getBoundingClientRect();
    xPadding = -(size.right - size.left)/2;
    yPadding = -((size.bottom - size.top) + 4);
  }
}
