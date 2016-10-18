/* globals d3 */

/**
 * A view that manages the map.
 */

var mapBackgroundColor = '#A3CCFF';
var stateBackgroundColor = '#F2ECCF';
var prettyColors = require('../data/prettyColors.js');

var panzoom = require('panzoom'); // for map zooming and panning

module.exports = createMap;

function createMap(mapModel, options) {
  if (!options) throw new Error('Options are not very optional here...');

  var width = window.innerWidth;
  var height = window.innerHeight;

  // First we set up the DOM
  var geoPath = makeGeoPath();
  var svg = makeSVGContainer();
  var background = makeMapBackground();
  var statesOutline = makeStatesOutline();
  var textLayer = makeTextLayer();

  // Then we make zoomable/panable
  panzoom(statesOutline[0][0]);

  var selectedState = d3.select(null);

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

  function refreshLabels() {
    textLayer.remove();
    textLayer = makeTextLayer();
  }

  function selectState() {
    if (selectedState.node() === this) return reset();

    selectedState.classed('active', false);
    selectedState = d3.select(this).classed('active', true);

    var selectedStateName = mapModel.getName(this);

    d3.selectAll('.state').filter(notThisState).transition().style('opacity', '0.3');
    d3.selectAll('.state-name').filter(notThisState).transition().style('opacity', '0.3');

    d3.select(this).style('opacity', 1);
    d3.selectAll('.state-name').filter(thisState).style('opacity', 1);

    var color = prettyColors[this.id % prettyColors.length];
    background.transition().style('fill', color);

    options.onStateSelected(selectedStateName);

    function thisState(d) {
      return !notThisState(d);
    }

    function notThisState(d) {
      return mapModel.getName(d) !== selectedStateName;
    }
  }

  function makeGeoPath() {
    var projection = d3.geo.albersUsa()
      .scale(2100)
      .translate([760, height / 2]);
    return d3.geo.path().projection(projection);
  }

  function makeSVGContainer() {
    return d3.select('body').append('svg')
      .style('width', width + 'px')
      .style('height', height + 'px');
  }

  function makeMapBackground() {
    return svg.append('rect')
      .attr('class', 'background')
      .attr('fill', mapBackgroundColor)
      .attr('width', width)
      .attr('height', height)
      .on('click', reset);
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
      .attr('class', 'state')
      .attr('fill', stateBackgroundColor)
      .attr('id', function(d) {
        return d.id;
      })
      .on('click', selectState);

    return statesOutline;
  }

  function makeTextLayer() {
    return statesOutline.append('g')
      .attr('class', 'states-names')
      .selectAll('text')
      .data(mapModel.paths)
      .enter()
      .append('svg:text')
      .attr('class', function(d) {
        return 'state-name ' + cssify(mapModel.getName(d));
      })
      .text(function(d) {
        var stateName = mapModel.getName(d);
        return options.getLabel(stateName);
      })
      .attr('x', function(d) {
        return geoPath.centroid(d)[0];
      })
      .attr('y', function(d) {
        return geoPath.centroid(d)[1];
      })
      .attr('text-anchor', 'middle');
  }

  function reset() {
    selectedState.classed('active', false);
    selectedState = d3.select(null);

    background.transition().style('fill', mapBackgroundColor);

    d3.selectAll('.state').transition().style('opacity', '1');
    d3.selectAll('.state-name').transition().style('opacity', 1);

    options.onStateSelected(null);
  }

  function cssify(str) {
    return str.toLowerCase().replace(/ /g, '-')
  }
}
