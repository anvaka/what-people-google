module.exports = parsePoints;

/**
 * Given svg path returns array of points.
 *
 * Note: Path can containe only simple instructions like M, L and Z. If
 * multiple paths are present the largest one is picked.
 */
function parsePoints(path) {
  if (path[0] !== 'M') throw new Error('Path should start with M');
  if (path[path.length - 1] !== 'Z') throw new Error('Path should end with Z');

  var largestPath = path.split('Z').sort(byLength)[0];

  return largestPath.substring(1)
    .split('L') // get all points
    .map(function(record) {
      var pair = record.split(',');
      return {
        x: parseFloat(pair[0]),
        y: parseFloat(pair[1])
      }
    });

}

function byLength(x, y) {
  return y.length - x.length;
}

function parseFloat(x) {
  var result = Number.parseFloat(x);
  if (Number.isNaN(result))
    throw new Error(x + ' is not a number');

  return result
}
