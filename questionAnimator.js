module.exports = createAnimator;

function createAnimator(container) {
  var currentElements = [];

  var api = {
    animate: animate,
    stop: stop
  };

  return api;

  function animate(list) {
    stop();
    currentElements = list.map(toTextContainer);
  }

  function stop() {
    currentElements.forEach(removeFromContainer);
    currentElements = [];
  }

  function removeFromContainer(element) {
    element.dispose();
  }

  function toTextContainer(suggestion, i) {
    return textContainer(container, suggestion, i);
  }
}

function textContainer(parent, content, index) {
  var fontSize = px((10 - index) + 18);

  var child = createHtmlElement(content);
  var addTimeout = setTimeout(appendChild, index * 100);

  return {
    dispose: dispose,
  }

  function appendChild() {
    parent.appendChild(child);
    addTimeout = 0;
  }

  function dispose() {
    if (addTimeout) window.clearTimeout(addTimeout);
    else parent.removeChild(child);
  }

  function createHtmlElement(innerHTML) {
    var element = document.createElement('a');
    var classList = element.classList;
    classList.add('question');
    classList.add('type-it');
    element.style.fontSize = fontSize;

    element.innerHTML = innerHTML;
    element.setAttribute('href', 'https://www.google.com/#q=' + window.encodeURIComponent(element.innerText));
    element.setAttribute('target', '_blank');

    return element;
  }
}

function px(value) {
  return value + 'px';
}
