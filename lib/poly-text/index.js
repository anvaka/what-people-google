var parsePoints = require('./lib/parsePoints.js');
var createTextMeasure = require('./lib/textMeasure.js');
var makeTextPathGeometry = require('./lib/textPathGeometry.js');

module.exports = createPolyText;

function createPolyText(scene) {
  var measureText = createTextMeasure(scene);

  var api = {
    getTextLayoutForPath: getTextLayoutForPath
  };

  return api;

  function getTextLayoutForPath(pathElement) {
    if (!pathElement) throw new Error('pathElement is required');

    var pathData = pathElement;
    if (pathElement.toString().indexOf('SVGPathElement') > -1) {
      pathData = pathElement.getAttribute('d');
    }
    var points;
    if (typeof pathData === 'string') {
      points = parsePoints(pathData);
    } else if (Array.isArray(pathElement)) {
      points = pathElement;
    } else {
      // Path element can only be:
      // * SVG `path` element
      // * String that represent `d` attribute of a path
      // * Array of points [{x, y}...]
      throw new Error('Unsupported pathElement type');
    }

    var textGeometry = makeTextPathGeometry(points, measureText);
    return textGeometry.getTextLayout;
  }
}
