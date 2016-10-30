module.exports = findCentroid;

/**
 * Finds centroid in the array of points
 */
function findCentroid(points) {
  var x = 0, y = 0;

  points.forEach(function(p) {
    x += p.x;
    y += p.y;
  });

  return {
    x: x / points.length,
    y: y / points.length,
  }
}
