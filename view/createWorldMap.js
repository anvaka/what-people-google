/* globals d3 */

/**
 * A view that manages the map.
 */

var mapBackgroundColor = '#A3CCFF';
var stateBackgroundColor = '#F2ECCF';

var createPolyText = require('../lib/poly-text/index.js');
var panzoom = require('panzoom'); // for map zooming and panning

module.exports = createMap;

function createMap(mapModel, options) {
  if (!options) throw new Error('Options are not very optional here...');

  var width = window.innerWidth;
  var height = window.innerHeight;

  // First we set up the DOM
  var projection = d3.geo.mercator()
      .scale(699 / Math.PI)
      .translate([1280 / 2, 699/ 2]);

  var geoPath = d3.geo.path().projection(projection);
  var svg = makeSVGContainer();
  var mapBackground = makeMapBackground();
  var statesOutline = makeStatesOutline();
  var zoomContainer = statesOutline[0][0];

  var polyText = createPolyText(zoomContainer);
  var textLayer = makeTextLayer();

  // Then we make zoomable/panable
  var zoomer = panzoom(zoomContainer);

  centerScene();

  var selectedState = d3.select(null);
  var selectStateTimeout; // used to differentiate between pan and select events
  var ignoreNextStateSelect;

  // and then make it respond to user events.
  listenToEvents();

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
    var xRatio = width /sceneRect.width;
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
    textLayer.remove();
    textLayer = makeTextLayer();
  }

  function listenToEvents() {
    window.addEventListener('resize', onWindowResize, false);

    mapBackground.on('mouseup', reset).on('touchstart', reset)

    statesOutline.selectAll('path')
      .on('mouseup', scheduleSelectState)
      .on('touchend', scheduleSelectState);

    zoomContainer.addEventListener('panstart', cancelSelectState);
  }

  function cancelSelectState() {
    if (selectStateTimeout) {
      window.clearTimeout(selectStateTimeout);
      selectStateTimeout = 0;
    } else {
      // we fired firest, make sure next selectState is ignored.
      ignoreNextStateSelect = true;
    }
  }

  function scheduleSelectState() {
    if (ignoreNextStateSelect) {
      ignoreNextStateSelect = false;
      return;
    }
    selectStateTimeout = setTimeout(selectState.bind(this), 30);
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
      .attr('d', geoPath)
      .attr('class', 'country')
      .attr('fill', stateBackgroundColor)
      .attr('stroke', '#999')
      .attr('stroke-width', '0.5px')
      .attr('stroke-dasharray', 1)
      .attr('stroke-linejoin', 'round')
      .attr('id', mapModel.getName);

    return statesOutline;
  }

  function makeTextLayer() {
    var container = statesOutline.append('g')
      .attr('class', 'states-names');

    d3.selectAll('.country').each(function(d) {
      var getTextLayout = polyText.getTextLayoutForPath(this);

      var stateName = mapModel.getName(d);
      var text = options.getLabel(stateName);
      var textLayout = getTextLayout(text);
      if (!textLayout) return;

      textLayout.forEach(function(line) {
        container.append('svg:text')
          .attr({
            'font-size': line.fontSize,
            x: line.x,
            y: line.y
          }).text(line.text);
      });
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
