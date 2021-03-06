/* globals d3 */

/**
 * A view that manages the map.
 */

var mapBackgroundColor = '#A3CCFF';
var stateBackgroundColor = '#F2ECCF';

var panzoom = require('panzoom'); // for map zooming and panning

var makeTooltip = require('./tooltip.js');
var createPolyText = require('../lib/poly-text/index.js');
var makeCountryLabels = require('../lib/containerLabels.js');
var makeVirtualLabels = require('./virtualLabels.js');
var countryColors = require('./getCountryColor.js')();
var saveCurrentTransform = require('../lib/saveCurrentTransform.js');

module.exports = createMap;

function createMap(mapModel, options) {
  if (!options) throw new Error('Options are not very optional here...');

  var width = window.innerWidth;
  var height = window.innerHeight;
  var virtualLabels

  // First we set up the DOM
  var projection = d3.geo.mercator()
      .scale(150)
      .translate([1280 / 2, 699/ 2]);

  var geoPath = d3.geo.path().projection(projection);
  var svg = makeSVGContainer();
  var mapBackground = makeMapBackground();
  var statesOutline = makeStatesOutline();
  var zoomContainer = statesOutline.node();
  var tooltip = makeTooltip(document.querySelector('.tooltip'));

  // Then we make zoomable/panable
  var zoomer = panzoom(zoomContainer, {
    bounds: true,
    boundsPaddding: 0.4,
    maxZoom: 40,
    minZoom: 0.05,
    zoomDoubleClickSpeed: 4, // 4x zoom on double tap
  });

  setInitialCoordinates();

  var selectedState = d3.select(null);
  var selectStateTimeout; // used to differentiate between pan and select events
  var countryLabels;

  // and then make it respond to user events.
  listenToEvents();
  setTimeout(refreshLabels, 0);

  var api = {
    /**
     * Removes selection from map
     */
    reset: reset,

    /**
     * Re-reads all labels from `options.getLabel()`
     */
    refreshLabels: refreshLabels,

    /**
     * Removes itself from the document
     */
    unload: unload
  }

  // That's it. The public API is over.
  return api;

  function unload() {
    tooltip.hide();
    zoomer.dispose();
    releaseEvents();

    if (virtualLabels) {
      virtualLabels.dispose()
    }
    svg.remove();
  }


  function setInitialCoordinates() {
    var transform = getTransformFromQueryState(options.queryState);
    if (transform) {
      var dw = transform.w - window.innerWidth;
      var dh = transform.h - window.innerHeight;
      zoomer.zoomAbs(0, 0, transform.scale);
      zoomer.moveTo(transform.x - dw * 0.5, transform.y - dh * 0.5);
    } else {
      centerScene();
    }
  }

  function centerScene() {
    var sceneRect = zoomContainer.getBBox()
    zoomer.moveBy(-sceneRect.x, -sceneRect.y)

    var scale = Math.min(width, height) / Math.max(sceneRect.width, sceneRect.height)

    var dx = (width - sceneRect.width * scale) / 2;
    var dy = (height - sceneRect.height * scale) / 2;

    zoomer.zoomAbs(0, 0, scale)
    zoomer.moveBy(dx, dy)
  }

  function reset() {
    selectedState.classed('active', false);
    selectedState = d3.select(null);

    options.onStateSelected(null);
  }

  function refreshLabels() {
    makeTextLayer();
  }

  function listenToEvents() {
    window.addEventListener('resize', onWindowResize, false);

    mapBackground.on('mouseup', reset).on('touchstart', reset)

    statesOutline.selectAll('path')
      .on('mousemove', showTooltip)
      .on('mouseleave', hideTooltip);

    zoomContainer.addEventListener('panstart', panZoomChanged);
    zoomContainer.addEventListener('zoom', panZoomChanged);
    zoomContainer.addEventListener('pan', panZoomChanged);
  }

  function releaseEvents() {
    window.removeEventListener('resize', onWindowResize, false);
    zoomContainer.removeEventListener('panstart', panZoomChanged);
    zoomContainer.removeEventListener('zoom', panZoomChanged);
    zoomContainer.removeEventListener('pan', panZoomChanged);
  }

  function showTooltip(d) {
    var stateName = mapModel.getName(d);
    var text = options.getLabel(stateName);
    if (text) tooltip.show(text, d3.event.clientX, d3.event.clientY);
  }

  function hideTooltip() {
    tooltip.hide();
  }

  function panZoomChanged() {
    cancelSelectState();
    saveCurrentTransform(zoomer.getTransform(), options.queryState);
  }

  function cancelSelectState() {
    if (selectStateTimeout) {
      window.clearTimeout(selectStateTimeout);
      selectStateTimeout = 0;
    }
  }

  function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;

    updateDimensions();
  }

  function updateDimensions() {
    svg.style('width', px(width)).style('height', px(height));

    mapBackground.attr('width', width).attr('height', height)
  }

  function makeSVGContainer() {
    return d3.select('body').append('svg')
      .attr('class', 'world')
      .style('width', px(width))
      .style('height', px(height));
  }

  function makeMapBackground() {
    return svg.append('rect')
      .attr('class', 'background')
      .attr('fill', mapBackgroundColor)
      .attr('width', width)
      .attr('height', height)
  }

  function makeStatesOutline() {
    var statesOutline = svg.append('g').attr('id', 'scene');

    statesOutline.append('g')
      .attr('class', 'states-bundle')
      .selectAll('path')
      .data(mapModel.paths)
      .enter()
      .append('path')
      .attr({
        fill: function(d) {
          var countryName = mapModel.getName(d);
          var color = countryColors[countryName]
          return color || stateBackgroundColor;
        },
        d: geoPath,
        class: 'country',
        stroke: '#333',
        'stroke-width': '0.3',
        'vector-effect': 'non-scaling-stroke',
        'id': mapModel.getName
      })

    var idToPath = makeIdToPath(d3.selectAll('.country'));

    var polyText = createPolyText(statesOutline[0][0]);
    countryLabels = makeCountryLabels(idToPath, polyText);

    return statesOutline;
  }

  function makeIdToPath(paths) {
    var idToPath = [];

    paths.each(function(d) {
      var countryId = mapModel.getName(d);

      idToPath.push({
        id: countryId,
        path: this.getAttribute('d')
      });
    })

    return idToPath;
  }

  function makeTextLayer() {
    if (virtualLabels) {
      virtualLabels.dispose()
    }

    var container = statesOutline.append('g').attr('class', 'states-names');

    virtualLabels = makeVirtualLabels(container, function() {
      if (zoomer) return zoomer.getTransform()
    });

    d3.selectAll('.country').each(function(d) {
      var stateName = mapModel.getName(d);
      var text = options.getLabel(stateName);

      countryLabels.computeLayout(stateName, text, renderLayout)

      // var textLayout = getTextLayout(text);
      // if (!textLayout) return;
      function renderLayout(textLayout) {
        textLayout.forEach(function(line) {
          virtualLabels.add(line)
        })
      }
    });

    return container;
  }
}

function px(x) { return x + 'px'; }

function getTransformFromQueryState(query) {
  var x = parseFloat(query.get('x'));
  var y = parseFloat(query.get('y'));
  var scale = parseFloat(query.get('scale'));
  if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(scale)) return;

  var w = parseInt(query.get('w'), 10);
  var h = parseInt(query.get('h'), 10);

  if (Number.isNaN(w)) w = window.innerWidth;
  if (Number.isNaN(h)) h = window.innerHeight;
  return { x: x, y: y, scale: scale, w: w, h: h};
}
