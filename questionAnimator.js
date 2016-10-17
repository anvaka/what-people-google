module.exports = createAnimator;

function createAnimator(container) {
  var maxQuotesCount = 10;
  var currentElements = [];

  var api = {
    animate: animate,
    stop: stop
  };

  requestAnimationFrame(frame);

  return api;

  function frame() {
    requestAnimationFrame(frame);
    currentElements.forEach(step);
  }

  function animate(list) {
    stop();

    while(currentElements.length < maxQuotesCount) {
      currentElements = currentElements.concat(list.map(toTextContainer));
    }
  }

  function stop() {
    currentElements.forEach(removeFromContainer);
    currentElements = [];
  }

  function removeFromContainer(element) {
    element.dispose();
  }

  function step(textContainer) {
    textContainer.step();
  }

  function toTextContainer(suggestion) {
    return textContainer(container, suggestion);
  }
}

function textContainer(parent, content) {
  var settings = createRandomSettings();

  var child = createHtmlElement(content);
  parent.appendChild(child);

  return {
    dispose: dispose,
    step: step
  }

  function step() {
    settings.lifeSpan -= 1;
    if (settings.lifeSpan < settings.halfPoint) {
      settings.halfPoint = Number.NEGATIVE_INFINITY;

      settings.dalpha *= -1;
      settings.dfont *= -1;
    }
    if (settings.lifeSpan < 0) {
      settings = createRandomSettings();
    }

    settings.x += settings.dx;
    settings.y += settings.dy;
    settings.alpha += settings.dalpha;
    settings.fontSize += settings.dfont;

    settings.fontSize = clamp(settings.fontSize, 6, 42);
    settings.alpha = clamp(settings.alpha, 0.3, 1);

    // render(child);
  }

  function dispose() {
    parent.removeChild(child);
  }

  function createHtmlElement(innerHTML) {
    var element = document.createElement('div');
    var classList = element.classList;
    classList.add('question');
    classList.add('animated');
    classList.add('fadeIn');

    element.innerHTML = innerHTML;

    render(element);

    return element;
  }

  function render(element) {
    element.style.left = px(settings.x);
    element.style.top = px(settings.y);
    element.style.fontSize = px(settings.fontSize);
    // element.style.opacity = settings.alpha;
  }

  function createRandomSettings() {
    var lifeSpan = Math.random() * 60 * 5 + 300;

    return {
      x: Math.random() * parent.clientWidth,
      y: Math.random() * parent.clientHeight,
      fontSize: Math.random() * 18 + 12,
      alpha: 0.3,

      dx: 0, //(Math.random() - 0.5) * 14 / 60,
      dy: 0, //(Math.random() - 0.5) * 14 / 60,
      dfont: 0, //Math.random() / 60,
      dalpha: Math.random() / 60,

      lifeSpan: lifeSpan,
      halfPoint: lifeSpan * 0.5
    }
  }
}

function px(value) {
  return value + 'px';
}

function clamp(x, min, max) {
  return x < min ? min : (x > max ? max : x);
}
