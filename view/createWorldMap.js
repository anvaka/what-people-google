/* globals d3 topojson */

/**
 * A view that manages the map.
 */

var mapBackgroundColor = '#A3CCFF';
var stateBackgroundColor = '#F2ECCF';
var labelStyles = getLabelStyles();

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
  var textLayer = makeTextLayer();

  // Then we make zoomable/panable
  var zoomContainer = statesOutline[0][0];
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

    mapBackground.on('click', reset).on('touchstart', reset)

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
      .attr('id', mapModel.getName);

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
        var className = cssify(mapModel.getName(d));
        return 'country-name ' + className;
      })
      .text(function(d) {
        var stateName = mapModel.getName(d);
        return options.getLabel(stateName);
      })
    .attr('font-size', function(d) {
      var className = cssify(mapModel.getName(d));
      return getFontSize(className);
    })
      .attr('x', function(d) {
        var className = cssify(mapModel.getName(d));
        var adjustment = getLabelAdjustment('x', className);
        return geoPath.centroid(d)[0] + adjustment;
      })
      .attr('y', function(d) {
        var className = cssify(mapModel.getName(d));
        var adjustment = getLabelAdjustment('y', className);
        return geoPath.centroid(d)[1] + adjustment;
      })
      .attr('text-anchor', 'middle');
  }


  function selectState() {
    selectStateTimeout = 0;
    if (selectedState.node() === this) return reset();

    selectedState.classed('active', false);
    selectedState = d3.select(this).classed('active', true);

    var selectedStateName = this.id;

    options.onStateSelected(selectedStateName);
  }

  function cssify(str) {
    return str.toLowerCase().replace(/ /g, '-')
  }
}

function px(x) { return x + 'px'; }

function getLabelAdjustment(kind, countryClassName) {
  var style = labelStyles[countryClassName];
  if (!style) return 0;
  return style[kind] || 0;
}

function getFontSize(countryClassName) {
  var style = labelStyles[countryClassName];
  if (!style) return '8px';
  return px(style.fontSize);
}


function getLabelStyles() {
  return {
    russia: {
      fontSize: 32,
      y: 30
    },
    france: {
      x: 14,
      y: -19
    },
    chad: {
      fontSize: 7,
      y: 5
    },
    gabon: {
      fontSize: 5,
      y: 4
    },
    'republic-of-the-congo': {
      fontSize: 4,
      y: -3
    },
    portugal: {
      fontSize: 7,
      y: 6
    },
    libya: {
      fontSize: 8,
      y: 5
    },
    egypt: {
      fontSize: 8,
      y: -4
    },

    'united-states-of-america': {
      x: 70,
      y: 70,
      fontSize: 26
    },
    antarctica: {
      fontSize: 36,
    },
    liberia: {
      fontSize: 4,
      y: 2,
    },
    gambia: {
      fontSize: 1,
    },
    'guinea-bissau': {
      fontSize: 2
    },
    guinea: {
      fontSize: 5,
    },
    togo: {
      fontSize: 1
    },
    benin: {
      fontSize: 3,
      y: -5,
    },
    ghana: {
      fontSize: 5,
      y: 14,
    },
    swaziland: {
      fontSize: 4
    },
    botswana: {
      fontSize: 6
    },
    madagascar: {
      y: 5,
      fontSize: 6,
    },
    mozambique: {
      fontSize: 6,
    },
    zambia: {
      y: 5,
      fontSize: 6,
    },
    malawi: {
      fontSize: 3,
      y: -2,
    },
    sudan: {
      y: -2,
    },
    malaysia: {
      y: 5
    },
    brunei: {
      fontSize: 1
    },
    zimbabwe: {
      fontSize: 5,
    },
    namibia: {
      y: 7,
      fontSize: 6
    },
    'south-africa': {
      y: 15,
    },
    lesotho: {
      fontSize: 2,
    },
    cameroon: {
      fontSize: 5,
      y: 8,
    },
    'burkina-faso': {
      fontSize: 5,
    },
    senegal: {
      fontSize: 4,
      x: -3,
      y: -3,
    },
    'sierra-leone': {
      fontSize: 4
    },
    'ivory-coast': {
      fontSize: 4
    },
    canada: {
      fontSize: 28,
      x: -40,
      y: 120,
    },
    jamaica: {
      fontSize: 2,
    },
    'puerto-rico': {
      fontSize: 2,
      y: 4,
    },
    haiti: {
      fontSize: 2,
      y: -1,
    },
    nicaragua: {
      fontSize: 4,
    },

    'el-salvador': {
      fontSize: 1,
    },
    honduras: {
      fontSize: 4,
    },
    belize: {
      fontSize: 2
    },
    panama: {
      fontSize: 2,
    },
    suriname: {
      fontSize: 5,
      y: 4,
    },
    'trinidad-and-tobago': {
      fontSize: 1,
    },
    colombia: {
      fontSize: 6,
    },
    guyana: {
      fontSize: 5,
      y: -3,
    },
    'dominican-republic': {
      fontSize: 3,
      y: 2,
    },
    finland: {
      y: -5,
    },

    nepal: {
      fontSize: 4,
    },
    uzbekistan: {
      fontSize: 4,
    },
    cambodia: {
      fontSize: 5,
      y: 1,
    },
    qatar: {
      fontSize: 4,
    },
    'united-arab-emirates': {
      fontSize: 4,
    },
    vietnam: {
      fontSize: 5,
    },
    laos: {
      fontSize: 5,
    },
    china: {
      fontSize: 12,
      y: 20
    },
    bangladesh: {
      fontSize: 3,
      y: -1,
    },
    kazakhstan: {
      fontSize: 10,
    },
    india: {
      y: 4,
    },
    bhutan: {
      fontSize: 1,
    },
    lebanon: {
      fontSize: 1,
    },
    'west-bank': {
      fontSize: 1,
    },
    'east-timor': {
      fontSize: 1,
    },
    cyprus: {
      fontSize: 1,
    },
    'northern-cyprus': {
      fontSize: 1,
    },
    luxembourg: {
      fontSize: 1,
    },
    greece: {
      fontSize: 5,
      y: 11
    },
    bangladesh: {
      fontSize: 2,
    },
    tajikistan: {
      fontSize: 2,
    },
    macedonia: {
      fontSize: 2,
    },
    albania: {
      fontSize: 2,
    },
    kuwait: {
      fontSize: 2,
    },
    switzerland: {
      fontSize: 2,
    },
    moldova: {
      fontSize: 2,
    },

    ireland: {
      fontSize: 5,
      y: 2,
    },

    israel: {
      fontSize: 3,
      y: 1,
    },
    'saudi-arabia': {
      y: 12,
    },
    greenland: {
      fontSize: 18,
      y: 20,
    },
    jordan: {
      fontSize: 3,
      y: (3),
    },
    germany: {
      fontSize: 6,
    },
    norway: {
      x: 20,
      y: 50,
      fontSize: 18
    },
    belgium: {
      fontSize: 4,
    },

    latvia: {
      fontSize: 5,
    },
    estonia: {
      fontSize: 5,
    },
    belarus: {
      fontSize: 5,
    },
    denmark: {
      fontSize: 5,
    },

    netherlands: {
      fontSize: 2,
    },
    lithuania: {
      fontSize: 2,
    },
    kosovo: {
      fontSize: 2,
    },
    'bosnia-and-herzegovina': {
      fontSize: 2,
    },
    slovenia: {
      fontSize: 2,
    },
    slovakia: {
      fontSize: 2,
    },
    austria: {
      fontSize: 2,
    },
    syria: {
      fontSize: 4,
    },
    iraq: {
      fontSize: 5
    },
    iran: {
      y: 6
    },
    afghanistan: {
      fontSize: 6,
      y: (-3)
    },
    pakistan: {
      fontSize: 7,
      y: (5),
    },
    turkmenistan: {
      fontSize: 5,
      y: (3),
    },
    hungary: {
      fontSize: 4,
      y: (1),
    },
    azerbaijan: {
      fontSize: 5,
      y: (4)
    },
    'czech-republic': {
      fontSize: 3,
    },

    armenia: {
      fontSize: 2,
      y: (-1)
    },
    romania: {
      fontSize: 5,
    },
    italy: {
      fontSize: 5,
    },
    poland: {
      fontSize: 6,
    },

    myanmar: {
      fontSize: 4,
    },
    'sri-lanka': {
      fontSize: 4,
    },
    oman: {
      fontSize: 4,
    },

    ukraine: {
      fontSize: 8,
    },
    turkey: {
      fontSize: 7,
      y: (3),
    },
    bulgaria: {
      fontSize: 3,
    },
    croatia: {
      fontSize: 4,
      x: (-5),
    },
    'equatorial-guinea': {
      fontSize: 1
    },
    burundi: {
      fontSize: 1,
    },

    rwanda: {
      fontSize: 1,
    },
    uganda: {
      fontSize: 6,
      y: (-3)
    },
    kenya: {
      y: (3),
    },

    'democratic-republic-of-the-congo': {
      y: (10)
    },
    'central-african-republic': {
      fontSize: 6,
      y: (3)
    },
    'south-sudan': {
      fontSize: 6,
    },
    somaliland: {
      fontSize: 2,
      y: (-3),
    },
    ethiopia: {
      fontSize: 6,
    },
    djibouti: {
      fontSize: 2,
    },
    eritrea: {
      fontSize: 2,
    },
    'western-sahara': {
      fontSize: 4
    },
    mauritania: {
      fontSize: 6,
      y: (-2),
    },
    niger: {
      y: (-5),
      fontSize: 9
    },
    mali: {
      y: (2),
      fontSize: 6,
    },
    yemen: {
      fontSize: 6,
    }
  };
}
