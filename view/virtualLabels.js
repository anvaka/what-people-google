module.exports = makeVirtualLabels;

function makeVirtualLabels(container, getTransform) {
  var lines = []
  var parent = container.node().ownerSVGElement
  listenToEvents()

  var api = {
    dispose: dispose,
    add: add,
    refresh: refresh
  }

  return api

  function refresh() {
    handleZoom()
  }

  function listenToEvents() {
    parent.addEventListener('zoom', handleZoom)
    parent.addEventListener('pan', handleZoom)
    parent.addEventListener('panend', handleZoom)
  }

  function dispose() {
    parent.removeEventListener('zoom', handleZoom)
    parent.removeEventListener('pan', handleZoom)
    parent.removeEventListener('panend', handleZoom)
  }

  function handleZoom() {
    var transform = getTransform()
    if (transform) {
      setDisplay(transform.scale, 'none')
    }
  }

  function setDisplay(scale) {
    var visibleRect = getVisibleRect();

    lines.forEach(function(l) {
      var fontSize = l.fontSize * scale;
      var lineIsOutside = outsideOfVisibleRect(l.line, fontSize)
      var fontTooSmall = fontSize <= 1.7
      var fontSuperTiny = fontSize <= 0.5

      if (lineIsOutside || fontSuperTiny) {
        l.hide();
      } else if (fontTooSmall) {
        // just pretend that there is something... Text is slow to render
        // and impossible to read at this scale. So... draw lines!
        l.showLines(scale)
      } else {
        l.showText()
      }
    });

    function outsideOfVisibleRect(line, fontSize) {
      var endOfLine = line.x + line.width;
      return endOfLine < visibleRect.x || line.x > visibleRect.x + visibleRect.width ||
        line.y + fontSize < visibleRect.y || line.y - fontSize > visibleRect.y + visibleRect.height;
    }
  }

  function getVisibleRect() {
    // TODO: this needs to be changed.
    var scene = parent.querySelector('#scene');
    var screenToScene = scene.getScreenCTM().inverse();

    var scale = screenToScene.a
    var x = screenToScene.e;
    var y = screenToScene.f;
    var width = scale * parent.clientWidth;
    var height = scale * parent.clientHeight;

    return {
      x: x,
      y: y,
      width: width,
      height: height
    }
  }


  function add(line) {
    lines.push(new Line(line, container));
  }
}

function Line(line, container) {
  this.hidden = true;
  this.line = line;
  this.selected = ''
  this.element

  this.fontSize = line.fontSize;
  this.container = container;

  this.showText();
}

Line.prototype = {
  hide: function() {
    if (!this.element) return;
    this.element.remove();
    this.element = null;
    this.selected = '';
  },

  showLines: function() {
    var consumedWidth = 0;
    if (this.selected !== 'line') {
      this.hide()

      var line = this.line
      var path = line.words.map(toPath)
      this.element = this.container.append('path')
          .attr({
            d: path,//  'M' + line.x + ',' + line.y + 'L' + (line.x + line.width) + ',' + line.y,
            stroke: '#000',
            'stroke-width': 0.2,
          });
      this.selected = 'line'
    }

    function toPath(wordWidth) {
      var start = line.x + consumedWidth
      consumedWidth += wordWidth.width

      return 'M' + start + ',' + line.y + 'L' + (start + wordWidth.width) + ',' + line.y
    }
  },

  showText: function() {
    if (this.selected !== 'text') {
      this.hide()

      var line = this.line

      this.element = this.container.append('svg:text')
            .attr({
              'font-size': line.fontSize,
              x: line.x,
              y: line.y,
            }).text(line.text);

      this.selected = 'text'
    }
  }
}
