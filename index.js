/* globals d3 */
var width = window.innerWidth;
var height = window.innerHeight;

var usa = require('./lib/usModel.js');
var colors = require('./prettyColors.js');
var queries = require('./lib/getQuestions.js');
var animator = require('./questionAnimator.js')(document.querySelector('.questions-container'));
var makeOptions = require('./makeOptions.js');

var mapBackgroundColor = '#A3CCFF';
var stateBackgroundColor = '#F2ECCF';

var dropDownQueries =  queries.listQueries();
dropDownQueries[0].selected = true;

var questionElement = document.querySelector('.input-question');
makeOptions(questionElement, dropDownQueries, onNewQuerySelected);

var query = queries.getQuery('why-is');

var active = d3.select(null);
var projection = d3.geo.albersUsa()
    .scale(2100)
    .translate([760, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .style('width', width + 'px')
    .style('height', height + 'px')

var background = svg.append('rect')
    .attr('class', 'background')
    .attr('fill', mapBackgroundColor)
    .attr('width', width)
    .attr('height', height)
    .on('click', reset);

var scene = svg.append('g').attr('id', 'scene');
var panzoom = require('panzoom');
panzoom(scene[0][0]);

scene.append('g')
  .attr('class', 'states-bundle')
  .selectAll('path')
  .data(usa.paths)
  .enter()
  .append('path')
  .attr('d', path)
  .attr('class', 'state')
  .attr('fill', stateBackgroundColor)
  .attr('id', function (d) { return d.id; })
  .on('click', selectState);

var text = appendTextLayer();

function onNewQuerySelected(queryId) {
    reset();

    query = queries.getQuery(queryId);
    text.remove();
    text = appendTextLayer();
}

function appendTextLayer() {
  return scene.append('g')
      .attr('class', 'states-names')
      .selectAll('text')
      .data(usa.paths)
      .enter()
      .append('svg:text')
      .attr('class', function(d)  {
          return 'state-name ' + cssify(usa.getName(d));
      })
      .text(function(d){
        var stateName = usa.getName(d);
        return query.getAutoCompleteTextForState(stateName);
      })
      .attr('x', function(d){
          return path.centroid(d)[0];
      })
      .attr('y', function(d){
          return path.centroid(d)[1];
      })
      .attr('text-anchor', 'middle');
}

function selectState() {
  if (active.node() === this) return reset();

  active.classed('active', false);
  active = d3.select(this).classed('active', true);

  var selectedStateName = usa.getName(this);

  d3.selectAll('.state').filter(notThisState).transition().style('opacity', '0.3');
  d3.selectAll('.state-name').filter(notThisState).transition().style('opacity', '0.3');

  d3.select(this).style('opacity', 1);
  d3.selectAll('.state-name').filter(thisState).style('opacity', 1);

  var color = colors[this.id % colors.length];
  background.transition().style('fill', color);

  var record = query.getSearchRecord(selectedStateName);
  animator.animate(record.suggestions);

  function thisState(d) {
    return !notThisState(d);
  }

  function notThisState(d) {
    return usa.getName(d) !== selectedStateName;
  }
}

function reset() {
  active.classed('active', false);
  active = d3.select(null);

  background.transition().style('fill', mapBackgroundColor);

  d3.selectAll('.state').transition().style('opacity', '1');
  d3.selectAll('.state-name').transition().style('opacity', 1);

  animator.stop();
}

function cssify(str) {
  return str.toLowerCase().replace(/ /g, '-')
}
