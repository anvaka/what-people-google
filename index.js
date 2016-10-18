/* globals d3, topojson */
var width = window.innerWidth;
var height = window.innerHeight;

var colors = require('./prettyColors.js');
var getQuestions = require('./getQuestions.js');
var animator = require('./questionAnimator.js')(document.querySelector('.questions-container'));
var makeOptions = require('./makeOptions.js');

var mapBackgroundColor = '#A3CCFF';
var stateBackgroundColor = '#F2ECCF';

var dataSet = require('./why.json')
var dropDownQuestions = Object.keys(dataSet).map(function(key) {
  return {
    value: key,
    text: dataSet[key].display,
    selected: false
  };
});

dropDownQuestions[0].selected = true;

var questionElement = document.querySelector('.input-question');
makeOptions(questionElement, dropDownQuestions, onNewQuestionSelected);

var questions = getQuestions(dataSet['why-is']);

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

var g = svg.append('g').attr('id', 'scene');

var scene = document.getElementById('scene')
var panzoom = require('panzoom');
panzoom(scene);

var unitedState = require('./us-states.json');

var data = topojson.feature(unitedState, unitedState.objects.states).features;
var names = require('./getNames.js')();

g.append('g')
  .attr('class', 'states-bundle')
  .selectAll('path')
  .data(data)
  .enter()
  .append('path')
  .attr('d', path)
  .attr('class', 'state')
  .attr('fill', stateBackgroundColor)
  .attr('id', function (d) { return d.id; })
  .on('click', selectState);

var text = renderFirstSuggestionOnStates();

function onNewQuestionSelected(question) {
    reset();
    questions = getQuestions(dataSet[question]);
    text.remove();
    text = renderFirstSuggestionOnStates();
}


function renderFirstSuggestionOnStates() {
    return g.append('g')
        .attr('class', 'states-names')
        .selectAll('text')
        .data(data)
        .enter()
        .append('svg:text')
        .attr('class', function(d)  {
            return 'state-name ' + cssify(getName(d));
        })
        .text(function(d){
            var stateName = getName(d);
            return questions.getTextByStateName(stateName);
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

  var selectedStateName = getName(this);

  d3.selectAll('.state').filter(notThisState).transition().style('opacity', '0.3');
  d3.selectAll('.state-name').filter(notThisState).transition().style('opacity', '0.3');

  d3.select(this).style('opacity', 1);
  d3.selectAll('.state-name').filter(thisState).style('opacity', 1);

  var color = colors[this.id % colors.length];
  background.transition().style('fill', color);

  var record = questions.getRecord(selectedStateName);
  selectQuery(record);

  function thisState(d) {
    return !notThisState(d);
  }

  function notThisState(d) {
    return getName(d) !== selectedStateName;
  }
}

function selectQuery(record) {
  animator.animate(record.suggestions);
}

function reset() {
  active.classed('active', false);
  active = d3.select(null);

  background.transition().style('fill', mapBackgroundColor);

  d3.selectAll('.state').transition().style('opacity', '1');
  d3.selectAll('.state-name').transition().style('opacity', 1);

  animator.stop();
}

function getName(d) {
  return names[d.id];
}

function cssify(str) {
  return str.toLowerCase().replace(/ /g, '-')
}
