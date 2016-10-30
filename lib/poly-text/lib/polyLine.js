module.exports = makePolyLine;

/**
 * provides an API to iterate over segments inside polyline.
 */
function makePolyLine(points) {
  // sort by x, so that we know when split-line enters/quits polygon.
  var sortedSegmentIndices = points.map(function(_, i) { return i; })
    .sort(function(firstSegmentIndex, secondSegmentIndex) {
      var a = getSegment(firstSegmentIndex);
      var b = getSegment(secondSegmentIndex);

      // make sure to sort by the smallest coordinate in each segment, because
      // polyline may go from east to west too.
      var minA = Math.min(a.from.x, a.to.x);
      var minB = Math.min(b.from.x, b.to.x);

      return minA - minB;
    });

  return {
    /**
     * Iterates over each segment in the poly line from west to east.
     */
    forEachSegment: forEachSegment,

    /**
     * Verifies that segment at given index is a local extremum
     */
    isLocalExtremum: isLocalExtremum
  };

  function getSegment(segmentIndex) {
    return {
      from: getPoint(segmentIndex),
      to: getPoint(segmentIndex + 1)
    };
  }


  function isLocalExtremum(segmentIndex) {
    var prev = getPoint(segmentIndex - 1);
    var next = getPoint(segmentIndex + 1);
    var y = getPoint(segmentIndex).y;

    // TODO: equality case?
    return (prev.y < y && next.y < y) || // local maximum
      (prev.y > y && next.y > y); // local minimum
  }

  function getPoint(idx) {
    var inRange = idx % points.length;
    if (inRange < 0) return points[points.length + inRange];
    return points[inRange];
  }

  function forEachSegment(callback) {
    if (points.length === 0) return;

    for (var i = 0; i < points.length; ++i) {
      var startIndex = sortedSegmentIndices[i];
      fireCallbackForSegment(startIndex);
    }

    function fireCallbackForSegment(from) {
      var to = from + 1
      if (to === points.length)
        to = 0; // loop the last point
      callback(points[from], points[to], from, to);
    }
  }
}
