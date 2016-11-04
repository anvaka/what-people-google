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

module.exports = createMap;

function createMap(mapModel, options) {
  if (!options) throw new Error('Options are not very optional here...');

  var width = window.innerWidth;
  var height = window.innerHeight;
  var virtualLabels

  // First we set up the DOM
  var projection = d3.geo.mercator()
      .scale(699 / Math.PI)
      .translate([1280 / 2, 699/ 2]);

  var geoPath = d3.geo.path().projection(projection);
  var svg = makeSVGContainer();
  var mapBackground = makeMapBackground();
  var statesOutline = makeStatesOutline();
  var zoomContainer = statesOutline.node();
  var textLayer;
  var tooltip = makeTooltip(document.querySelector('.tooltip'));

  // Then we make zoomable/panable
  var zoomer = panzoom(zoomContainer);

  centerScene();

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
    refreshLabels: refreshLabels
  }

  // That's it. The public API is over.
  return api;

  function centerScene() {
    var sceneRect = zoomContainer.getBoundingClientRect();
    var xRatio = width / sceneRect.width;
    zoomer.zoomTo(0, 0, xRatio);
    sceneRect = zoomContainer.getBoundingClientRect();
    if (sceneRect.top < 0) {
      var dy = (height - sceneRect.height)/2;
      if (dy < 0) {
        dy = 0; // no need to move anything, if map is too large
      }
      zoomer.moveBy(0, -sceneRect.top + dy);
    }
  }

  function reset() {
    selectedState.classed('active', false);
    selectedState = d3.select(null);

    mapBackground.transition().style('fill', mapBackgroundColor);

    d3.selectAll('.country').transition().style('opacity', '1');
    d3.selectAll('.country-name').transition().style('opacity', 1);

    options.onStateSelected(null);
  }

  function refreshLabels() {
    if (textLayer) textLayer.remove();

    textLayer = makeTextLayer();
  }

  function listenToEvents() {
    window.addEventListener('resize', onWindowResize, false);

    mapBackground.on('mouseup', reset).on('touchstart', reset)

    statesOutline.selectAll('path')
      .on('mousemove', showTooltip)
      .on('mouseleave', hideTooltip);
      // .on('mouseup', scheduleSelectState)
      // .on('touchend', scheduleSelectState);

    zoomContainer.addEventListener('panstart', cancelSelectState);
    zoomContainer.addEventListener('zoom', cancelSelectState);
    zoomContainer.addEventListener('pan', cancelSelectState);
  }

  function showTooltip(d) {
    var stateName = mapModel.getName(d);
    var text = options.getLabel(stateName);
    if (text) tooltip.show(text, d3.event.clientX, d3.event.clientY);
  }

  function hideTooltip() {
    tooltip.hide();
  }

  function cancelSelectState() {
    if (selectStateTimeout) {
      window.clearTimeout(selectStateTimeout);
      selectStateTimeout = 0;
    }
  }

  function scheduleSelectState() {
    cancelSelectState();
    selectStateTimeout = setTimeout(selectState.bind(this), 200);
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
        path: getPathOverride(countryId) || this.getAttribute('d')
      });
    })

    return idToPath;
  }

  function makeTextLayer() {
    var container = statesOutline.append('g').attr('class', 'states-names');
    if (virtualLabels) {
      virtualLabels.dispose()
    }

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


  function selectState() {
    selectStateTimeout = 0;
    if (selectedState.node() === this) return reset();

    selectedState.classed('active', false);
    selectedState = d3.select(this).classed('active', true);

    var selectedStateName = this.id;

    options.onStateSelected(selectedStateName);
  }
}

function px(x) { return x + 'px'; }

function getPathOverride(countryId) {
  if (countryId === 'Indonesia') {
    return 'M1010,348L1187,348L1187,380L1010,380Z';
  }
}
