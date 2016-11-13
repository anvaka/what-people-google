module.exports = createDateSelector;

function createDateSelector(container, index, selectedFile, onChanged) {
  var select = container.querySelector('select');
  select.innerHTML = index.map(toOptionHTML).join('\n');
  select.addEventListener('change', onSelectChanged);
  container.appendChild(select)

  function onSelectChanged(e) {
    var selectedValue = e.target.value;
    onChanged(selectedValue);
  }

  function toOptionHTML(option) {
    var selected = option === selectedFile ? ' selected ' : '';
    return '  <option value="' + option + '"' + selected + '>' + toDate(option) + '</option>';
  }
}


function toDate(str) {
  if (!str) throw new Error('cannot convert empty string to date');

  var extension = str.indexOf('.json');
  if (extension < 0) throw new Error('Something is not right. Extension should be .json');

  str = str.substring(0, extension);
  return str;
}
