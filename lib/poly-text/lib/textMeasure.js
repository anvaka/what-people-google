var svgns = 'http://www.w3.org/2000/svg';
var xmlns = 'http://www.w3.org/XML/1998/namespace';

module.exports = createTextMeasure;

function createTextMeasure(svgContainer) {
  var cachedSizes = {};
  // TODO: If you need custom language, you might wanna extend this.
  var abc = 'abcdefghijklmnopqrstuvwxyz';
  var avgLetterWidthByFontSize = {};

  return measure;

  function measure(text, fontSize) {
    var cacheKey = text + fontSize;
    var cachedResult = cachedSizes[cacheKey];
    if (cachedResult) return cachedResult;
    var result = {};

    cachedSizes[cacheKey] = result;

    var textContainer = window.document.createElementNS(svgns, 'text');
    // set the font size that is requested.
    textContainer.setAttributeNS(null, 'font-size', fontSize);
    // we need this to measure words separators.
    textContainer.setAttributeNS(xmlns, 'xml:space', 'preserve');

    svgContainer.appendChild(textContainer);

    result.words = text.split(/\s/).map(toWordWidths);
    result.spaceWidth = measureSpaceWidth();
    result.totalWidth = sumUpWordsLengthInPixels(result.words, result.spaceWidth);

    svgContainer.removeChild(textContainer);

    return result;

    function sumUpWordsLengthInPixels(words, spaceWidth) {
      var width = 0;

      words.forEach(function(word) { width += word.width; });
      width += (words.length - 1) * spaceWidth;

      return width;
    }

    function measureSpaceWidth() {
      var spaceWidthKey = 'space' + fontSize;
      var spaceWidth = avgLetterWidthByFontSize[spaceWidthKey];
      if (!spaceWidth) {
        textContainer.textContent = ' ';
        spaceWidth = measureTextWidth(textContainer);
        avgLetterWidthByFontSize[spaceWidthKey] = spaceWidth;
      }

      return spaceWidth;
    }

    function toWordWidths(text) {
      return {
        text: text,
        width: measureAvgWidth(text)
      };
    }

    function measureAvgWidth(text) {
      var avgWidthAtFontSize = avgLetterWidthByFontSize[fontSize];
      if (!avgWidthAtFontSize) {
        textContainer.textContent = abc;
        var abcWidth = measureTextWidth(textContainer);
        avgWidthAtFontSize = abcWidth/abc.length;
        avgLetterWidthByFontSize[fontSize] = avgWidthAtFontSize;
      }

      return avgWidthAtFontSize * text.length;
    }
  }
}

function measureTextWidth(svgTextElement) {
  var result = svgTextElement.getBBox();
  return result.width;
}
