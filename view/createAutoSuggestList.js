/**
 * Renders list of all available suggestions inside a given domContainer.
 */
module.exports = createAutoSuggestList;

function createAutoSuggestList(domContainer) {
  var currentElements = [];
  var hasChildrenClass = 'has-children';

  var api = {
    /**
     * Show list of suggestions
     */
    show: show,

    /**
     * Hide list of suggestions
     */
    hide: hide
  };

  return api;

  function show(list) {
    currentElements.forEach(removeFromContainer);
    currentElements = list.map(toSuggestionContainer);
    if (list.length > 0) {
      domContainer.classList.add(hasChildrenClass);
    } else {
      domContainer.classList.remove(hasChildrenClass);
    }
  }

  function hide() {
    currentElements.forEach(removeFromContainer);
    currentElements = [];
    domContainer.classList.remove(hasChildrenClass);
  }

  function removeFromContainer(element) {
    element.dispose();
  }

  function toSuggestionContainer(suggestion, i) {
    return suggestionContainer(domContainer, suggestion, i);
  }
}

/**
 * Creates a single suggestion DOM element inside `parentElement`.
 */
function suggestionContainer(parentElement, content) {
  var child = createHtmlElement(content);
  parentElement.appendChild(child);

  return {
    /**
     * Removes current DOM element from the view
     */
    dispose: dispose,
  }

  function dispose() {
    parentElement.removeChild(child);
  }

  function createHtmlElement(innerHTML) {
    var element = document.createElement('a');
    var classList = element.classList;
    classList.add('suggestion');

    element.innerHTML = innerHTML;
    element.setAttribute('href', 'https://www.google.com/#q=' + window.encodeURIComponent(element.innerText));
    element.setAttribute('target', '_blank');

    return element;
  }
}
