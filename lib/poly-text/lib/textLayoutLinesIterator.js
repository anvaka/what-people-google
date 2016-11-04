module.exports = textLayoutLinesIterator;

function textLayoutLinesIterator(lines, fontSize) {

  return {
    forEach: forEach
  };

  function forEach(callback) {
    lines.forEach(function(line) {
      if (line.isEmpty()) return;

      callback({
        fontSize: fontSize,
        text: line.getText(),
        x: line.getX(),
        // 0.3 is emperical value - tried to center text. This could be very-much
        // font-specific and may require configuration in future.
        y: line.getY() - fontSize * 0.3,
        width: line.getWidth(),
        words: line.getAddedWords()
      });
    });
  }
}
