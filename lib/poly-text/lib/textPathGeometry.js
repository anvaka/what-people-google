var makePolyLine = require('./polyLine.js');
var findCentroid = require('./findCentroid.js');
var makeTextLayoutLinesIterator = require('./textLayoutLinesIterator.js');
var makeTextLine = require('./textLine.js');

module.exports = makeTextPathGeometry;

function makeTextPathGeometry(points, measureText) {
  var bounds = getBounds(points);
  var slicesCount = 100;
  var slicer = makeSlicer(bounds, slicesCount);

  var polyLine = makePolyLine(points);
  // TODO: Remove appendSliceLine?
  var lines = {};
  slicer.forEach(appendSliceLine)

  var candidates = Object.keys(lines).map(toRankedCandidates);
  var area = computeAreaInside(candidates);

  // Compute composite rank now:
  candidates.forEach(computeRank);

  // Find the index of the the horizontal line, that has the highest "rank".
  // That index is our best candidate for label placement.
  var candidateIndex = findBestCandidateIndex();
  // Trnaslate that index into country coordinates
  var ratio = bounds.height/slicesCount;

  // and get the offset - this is where we want to render label by default.
  var yOffset = bounds.minY + ratio * candidateIndex;
  // try to move label somewhere between centroid and place with largest score.
  var centroid = findCentroid(points);
  yOffset = (centroid.y + yOffset)/2;

  return {
    bounds: bounds,
    // points: points,
    getTextLayout: getTextLayout
  };

  function getTextLayout(text) {
    var maxFontSize = 24; // TODO: Make configurable
    var fontSize = Math.max(0.1, getSuggestedFontSize(text)) + 1;

    var suggestedLayout = getLayoutForFont(fontSize);
    if (suggestedLayout) {
      // TODO: This can probably be removed... Not sure yet.
      // go up!
      var newLayout;
      do {
        fontSize += 1;
        newLayout = getLayoutForFont(fontSize);
        if (newLayout) suggestedLayout = newLayout;
      } while (newLayout && fontSize < maxFontSize);
    } else {
      // go down
      var maxFontDecrease = 4;
      while (!suggestedLayout && fontSize > 0) {
        fontSize -= 1;
        if (fontSize <= 0 && maxFontDecrease > 0) {
          fontSize = 1 - 1/(maxFontDecrease * 2);
          maxFontDecrease -= 1;
        }

        suggestedLayout = getLayoutForFont(fontSize);
      }
    }

    return suggestedLayout;

    function getLayoutForFont(fontSize) {
      if (fontSize <= 0) {
        return;
      }
      var availableLines = getAllRectanglesAtHeight(yOffset, fontSize);
      if (!availableLines.start) {
        // This means that there is no rectangle with height `fontSize` can be
        // embedded inside pologyon. Reduce the font size and try again
        return;
      }

      // split the text into words
      var input = measureText(text, fontSize);
      var words = input.words;

      // This should give [middle], [north[0], middle], [north[0], middle, south[0]] ...
      var possibleLineLayouts = makePossibleLayouts(availableLines, input.spaceWidth);

      for (var i = 0; i < possibleLineLayouts.length; ++i) {
        var lineLayout = possibleLineLayouts[i];
        var textInLineLayout = tryLineLayout(lineLayout);
        if (textInLineLayout) {
          return textInLineLayout;
        }
      }

      return null;

      function tryLineLayout(lineLayout) {
        // TODO This could be one possible optimization:
        // if (lineLayout.totalWidth < input.totalWidth) {
        //   // we know for sure, that this line layout is smaller than required
        //   // width by the text. bail out quickly.
        //   return;
        // }

        var currentLineIndex = 0;
        var currentWordIndex = 0;
        var layoutStarted = false;

        while (currentWordIndex < words.length) {
          if (currentLineIndex >= lineLayout.length) {
            // No more lines to fit the text
            return;
          }

          var currentWord = words[currentWordIndex];
          var currentLine = lineLayout[currentLineIndex];

          if (currentLine.add(currentWord)) {
            // Yay! This word fits inside this line. Move on to the next one:
            currentWordIndex += 1;

            // from now on, we cannot break layout. Should keep adding lines
            // while we can.
            layoutStarted = true;
          } else if (currentLine.isEmpty() && layoutStarted) {
            // This means that no word can fit this line, and thus the entire
            // layout doesn't fit.
            return; // TODO: should I return line index?
          } else {
            // The line cannot fit any more text. Move on to the next line and retry:
            currentLineIndex += 1;
          }
        }

        // if we are here - the words can fit this line layout!
        return makeTextLayoutLinesIterator(lineLayout, fontSize);
      }
    }

    function makePossibleLayouts(availableLines, spaceWidth) {
      var lineLayouts = [];
      if (!availableLines.start) return lineLayouts;

      var totalLength = availableLines.north.length + availableLines.south.length + 1;
      var northOffset = -1;
      var southOffset = 0;

      var iterationCounter = 0;
      while (northOffset + southOffset < totalLength) {
        var layout = [];
        var i = 0;
        // add everything from north first
        for (i = northOffset; i >= 0; --i) {
          addLine(availableLines.north[i]);
        }

        // then middle
        addLine(availableLines.start);

        // then south
        for (i = 0; i < southOffset; ++i) {
          addLine(availableLines.south[i]);
        }

        // layout is ready!
        if (lineLayouts.length > 0) {
          if (last(lineLayouts).length < layout.length) {
            // only add layout if it has more lines than the previous one.
            lineLayouts.push(layout);
          }
        } else {
          lineLayouts.push(layout)
        }

        // increase movement so that we are alternating between north/south
        iterationCounter += 1;
        if (iterationCounter % 2 === 1) {
          northOffset += 1;
        } else {
          southOffset += 1;
        }
      }

      return lineLayouts;

      function addLine(lineRecangle) {
        if (lineRecangle) layout.push(makeTextLine(lineRecangle, spaceWidth));
      }
    }

    function getAllRectanglesAtHeight(midPoint, rectHeight) {
      var rects = [];
      var midPointHeight = (midPoint - bounds.minY);
      var slicesCount = Math.floor(midPointHeight/rectHeight);
      var dy = (midPointHeight - slicesCount * rectHeight);
      var y = bounds.minY + dy;
      var foundRects = 0;

      while (y < bounds.maxY) {
        rects[foundRects++]  = getRectForHeight(y, rectHeight);
        y += rectHeight;
      }

      var startFrom = slicesCount;
      var startRect = rects[startFrom];
      if (!startRect) {
        var nearestIndexOnNorth = getNearestAtNorth(startFrom)
        var nearestIndexOnSouth = getNearestAtSouth(startFrom);
        if (Number.isFinite(nearestIndexOnNorth) && !Number.isFinite(nearestIndexOnSouth)) {
          startFrom = nearestIndexOnNorth;
        } else if (!Number.isFinite(nearestIndexOnNorth) && Number.isFinite(nearestIndexOnSouth)) {
          startFrom = nearestIndexOnSouth;
        } else if (!Number.isFinite(nearestIndexOnNorth) && !Number.isFinite(nearestIndexOnSouth)) {
          return {
            north: [],
            start: null, // not found.
            south: []
          };
        } else {
          var ds = Math.abs(nearestIndexOnSouth - startFrom);
          var dn = Math.abs(nearestIndexOnNorth - startFrom);
          startFrom = ds < dn ? nearestIndexOnSouth : nearestIndexOnNorth;
        }

        startRect = rects[startFrom];
      }

      var finalRects = {
        north: [],
        start: startRect,
        south: []
      }

      populateFinalRects(startFrom);
      filterNonOverlapingRects(finalRects);

      return finalRects;

      function filterNonOverlapingRects(rects) {
        filter(rects.start, rects.north);
        filter(rects.start, rects.south);

        function filter(start, array) {
          var i = 0;
          while (i < array.length && intersects(start, array[i])) {
            start = array[i];
            i += 1;
          }
          if (i < array.length) {
            array.splice(i);
          }
        }

        function intersects(rect1, rect2) {
          var from = Math.max(rect1.left, rect2.left);
          var to = Math.min(rect1.right, rect2.right);
          return to - from > 0;
        }
      }

      function getNearestAtNorth(startFrom) {
        var idx = startFrom;
        do {
          var candidate = rects[idx];
          if (candidate) return idx;

          idx -= 1;
        } while (idx > -1);
      }

      function getNearestAtSouth(startFrom) {
        var idx = startFrom;
        do {
          var candidate = rects[idx];
          if (candidate) return idx;

          idx += 1;
        } while (idx < foundRects);
      }

      function populateFinalRects(startFrom) {
        var goSouth = true; var southOffset = 1;
        var goNorth = true; var northOffset = 1;

        var candidate;

        while(goSouth || goNorth) {
          if (goNorth) {
            candidate = rects[startFrom - northOffset];
            if (candidate) {
              finalRects.north.push(candidate);
              northOffset += 1;
            } else {
              goNorth = false;
            }
          }

          if (goSouth) {
            candidate = rects[startFrom + southOffset];
            if (candidate) {
              finalRects.south.push(candidate);
              southOffset += 1;
            } else {
              goSouth = false;
            }
          }
        }
      }
    }

    function getRectForHeight(midPoint, height) {
      var top = midPoint - height/2;
      var bottom = midPoint + height/2;
      var topIntervals = getIntervals(top);
      var bottomIntervals = getIntervals(bottom);
      var intersections = findIntersections(topIntervals, bottomIntervals);

      var longestSegment = findLongestSegment(intersections);

      if (!longestSegment) {
        // we may not get any intersections at this height. Which means we cannot
        // fit text entirely here.
        return;
      }

      // Add small padding (1% of the rectangle width), so that labels are not
      // too close to the borders
      var padding = (longestSegment.to - longestSegment.from) * 0.1;

      return {
        left: longestSegment.from + padding,
        top: top,
        right: longestSegment.to - padding,
        bottom: bottom
      };
    }

    function findLongestSegment(segments) {
      var longest = segments[0];

      segments.forEach(function(segment) {
        if (longest.length < segment.length) longest = segment;
      })

      return longest;
    }

    // finds all intersections between two arrays of segments.
    function findIntersections(topIntervals, bottomIntervals) {
      var smaller, larger;
      if (topIntervals.min <= bottomIntervals.min) {
        smaller = topIntervals;
        larger = bottomIntervals;
      } else {
        smaller = bottomIntervals;
        larger = topIntervals;
      }

      var intersections = [];

      while(smaller.hasMore) {
        while (smaller.min > larger.max && larger.hasMore) {
          // this means that our next interval does not intersect first interval
          larger.next();
        }

        if (!larger.hasMore) {
          // we exhasted the interval. All intersections are found.
          break;
        }

        if (smaller.max < larger.min) {
          // this means that smaller interval does not intersect larger one.
          // Move to the next one in this array.
          smaller.next();
          // And if the next one is larger than our largest, then swap
          if (smaller.min > larger.min) {
            swapIntervals();
          }
        } else {
          var from = larger.min;
          var to;
          if (larger.max < smaller.max) {
            to = larger.max;
            larger.next();
          } else {
            to = smaller.max;
            smaller.next();
            swapIntervals();
          }

          intersections.push({
            from: from,
            to: to,
            length: to - from
          });
        }
      }

      return intersections;

      function swapIntervals() {
        var t = smaller;
        smaller = larger;
        larger = t;
      }
    }

    // returns array of intervals, that lie inside country area at offset `yOffset`
    function getIntervals(yOffset) {
      var segments = findSegmentsOnLine({
        y: yOffset,
        x: bounds.minX
      });
      return segmentsCollection(segments);
    }

    function segmentsCollection(segments) {
      var api = {
        min: undefined,
        max: undefined,
        hasMore: undefined,
        next: next,
      };

      var currentIndex = -1;
      next();

      return api;

      function next() {
        currentIndex += 1;
        var enterIndex = currentIndex * 2;
        var exitIndex = enterIndex + 1;
        if (exitIndex < segments.length) {
          api.hasMore = true;
          api.min = segments[enterIndex].x;
          api.max = segments[exitIndex].x;
        } else {
          api.hasMore = false;
          api.min = undefined;
          api.max = undefined;
        }
      }
    }

    function getSuggestedFontSize(text) {
      if (text.length === 0) return 0;

      // TODO: This needs to be improved. Current idea is that we want label
      // to occupy less than 15% (0.15) of an area.
      var maxCountrySpaceRatio = 0.45;
      var fontSize = Math.round( Math.sqrt(area * maxCountrySpaceRatio / text.length));
      return Math.min(fontSize, maxFontSize); //Math.min(maxFontSize, Math.round(bounds.height / 2));
    }
  }

  function computeAreaInside(candidates) {
    var area = 0;
    candidates.forEach(function(candidate) {
      area += candidate.distance.inside;
    });

    return area;
  }

  function getBounds(points) {
    var minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY;
    var maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY;

    points.forEach(function(p) {
      if (p.x < minX)
        minX = p.x;
      if (p.y < minY)
        minY = p.y;
      if (p.x > maxX)
        maxX = p.x;
      if (p.y > maxY)
        maxY = p.y;
    });

    return {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  function findBestCandidateIndex() {
    var bestRank = Number.NEGATIVE_INFINITY;
    var bestCandidateForLabelBase = -1;

    candidates.forEach(function(candidate, i) {
        if (candidate.rank > bestRank) {
          bestRank = candidate.rank;
          bestCandidateForLabelBase = i;
        }
    });

    return bestCandidateForLabelBase;
  }

  function computeRank(candidate, idx) {
    candidate.rank = neighboursArea(candidate, idx);
  }

  function neighboursArea(candidate, idx) {
    var candidatesToConsider = 20;

    var totalArea = 0;

    for(var i = idx - candidatesToConsider; i < idx + candidatesToConsider; ++i) {
      if (i < 0 || i >= candidates.length) continue; // Assume those values 0;

      // TODO: Do I need to fade away value the further it goes?
      // var fadePenalty = Math.abs(idx - i);
      totalArea += candidates[i].distance.inside;
    }

    return totalArea/(candidatesToConsider * 2);
  }

  function toRankedCandidates(lineId) {
    var segments = lines[lineId];

    return {
      lineId: lineId,
      segments: segments,
      segmentsCount: segments.length,
      distance: getSegmentDistance(segments)
    };
  }

  function getSegmentDistance(points) {
    var distanceInside = 0;
    var distanceOutside = 0;

    points.forEach(function(p, idx) {
      if (idx === 0) return;

      var distance = p.x - points[idx - 1].x;
      var pointInside = (idx % 2) === 0;
      if (pointInside)
        distanceOutside += distance;
      else
        distanceInside += distance;
    });

    return {
      inside: distanceInside,
      outside: distanceOutside
    };
  }

  function appendSliceLine(point) {
    var segmentsOnLine = findSegmentsOnLine(point);
    lines[point.y] = segmentsOnLine;
  }

  function findSegmentsOnLine(point) {
    var segmentsOnLine = [];
    polyLine.forEachSegment(visitSegment);

    if (segmentsOnLine.length > 1) return segmentsOnLine;

    // if only one point on polygon intersects the point, there is no
    // reason to return it:
    return [];

    // Note: this can be improved by indexing points first (so that we don't have
    // O(n) during intersection search. I think it could be done in O(lg N) but
    // don't want to spend time on this yet.
    function visitSegment(from, to, fromIndex, toIndex) {
      if ((from.y < point.y && to.y < point.y) ||
        (from.y > point.y && to.y > point.y)
      ) {
        // Segment is entirely on the same side, it surely does not intersect our line
        return;
      }

      if (from.x === point.x && from.y === point.y) {
        return;
      }

      // this is our `to` case. In general, we should include it. However if this
      // point is a local extremum, we should ignore it (it means it lies on a border itself)
      if ((to.y === point.y && polyLine.isLocalExtremum(toIndex)) ||
        (from.y === point.y && polyLine.isLocalExtremum(fromIndex))
      ) {
        return;
      }

      var dx = to.x - from.x;
      var dy = to.y - from.y;
      if (dy === 0) {
        // This means that the segment is a horizontal line. Just take an endpoint.
        // TODO: I don't think this is correct.
        appendPointToSegment({
          x: Math.min(to.x, from.x),
          y: from.y
        });
        return;
      }

      // We know y of our horizontal line, and since two points lie on the same interval,
      // we can use slope equation to find x of a smaller point (dy/dx = dy0/dx0 =>)
      var x = from.x + (point.y - from.y) * dx / dy
      appendPointToSegment({
        x: x,
        y: point.y
      })
    }

    function appendPointToSegment(p) {
      if (pointVisited(p)) return;

      if (segmentsOnLine.length > 0) {
        var lastSegment = last(segmentsOnLine)
        if (lastSegment.x === p.x) {
          // This can happen if we intersect a point that appears on both start
          // and end of the interval. If it was already added to the segments -
          // there is no reason to add it twice.
          return;
        }
      }

      segmentsOnLine.push(p);
    }

    function pointVisited(p) {
      for (var i = 0; i < segmentsOnLine.length; ++i) {
        var segmentPoint = segmentsOnLine[i];
        if (segmentPoint.x === p.x && segmentPoint.y === p.y) return true;
      }
    }
  }

  function makeSlicer(bounds, slicesCount) {
    var sliceWidth = bounds.height / slicesCount;

    return {
      forEach: forEach
    }

    function forEach(callback) {
      for (var i = 0; i < slicesCount; ++i) {
        callback({
          y: bounds.minY + sliceWidth * i,
          x: bounds.minX
        }, i);
      }
    }
  }
}

function last(array) {
  if (array.length > 0) return array[array.length - 1];
}
