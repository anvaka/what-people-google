module.exports = makeTextLine;

function makeTextLine(lineRecangle, spaceWidth) {
  var addedWords = [];
  var lineWidth = lineRecangle.right - lineRecangle.left;
  var availableWidth = lineWidth;
  var wordsWidth = 0;

  return {
    add: add,
    isEmpty: isEmpty,
    getX: getX,
    getY: getY,
    getText: getText
  };

  function getText() {
    return addedWords.map(toWord).join(' ');
  }

  function toWord(wordWidth) {
    return wordWidth.text;
  }

  function getX() {
    return lineRecangle.left + (lineWidth - wordsWidth)/2;
  }

  function getY() {
    return lineRecangle.bottom;
  }

  function add(word) {
    var requiredWidth = word.width;

    if (!isEmpty()) {
      // words should be separated by space
      requiredWidth += spaceWidth;
    }

    if (availableWidth - requiredWidth >= 0) {
      addedWords.push(word);
      availableWidth -= requiredWidth;
      wordsWidth += requiredWidth;

      return true;
    }
  }

  function isEmpty() {
    return addedWords.length === 0;
  }
}
