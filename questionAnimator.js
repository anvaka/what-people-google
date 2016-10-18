module.exports = createAutoSuggestList;

function createAutoSuggestList(domContainer) {
  var currentElements = [];

  var api = {
    show: show,
    hide: hide
  };

  return api;

  function show(list) {
    hide();
    currentElements = list.map(toSuggestionContainer);
  }

  function hide() {
    currentElements.forEach(removeFromContainer);
    currentElements = [];
  }

  function removeFromContainer(element) {
    element.dispose();
  }

  function toSuggestionContainer(suggestion, i) {
    return suggestionContainer(domContainer, suggestion, i);
  }
}

function suggestionContainer(parentElement, content, index) {
  var fontSize = px((10 - index) + 18);

  var child = createHtmlElement(content);
  var addTimeout = setTimeout(appendChild, index * 100);

  return {
    dispose: dispose,
  }

  function appendChild() {
    parentElement.appendChild(child);
    addTimeout = 0;
  }

  function dispose() {
    if (addTimeout) window.clearTimeout(addTimeout);
    else parentElement.removeChild(child);
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
