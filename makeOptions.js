module.exports = makeOptions;

function makeOptions(container, questions, onChanged) {
  var select = document.createElement('select');
  select.classList.add('back-dropdown');
  select.innerHTML = questions.map(toOptionHTML).join('\n');
  select.addEventListener('change', onSelectChanged);
  container.appendChild(select)

  var selectedOption = findSelected(questions);
  setLabelText(selectedOption);

  function onSelectChanged(e) {
    var selectedValue = e.target.value;
    setLabelText(findByValue(e.target.value));

    onChanged(selectedValue);
  }

  function setLabelText(option) {
    if (option) {
      container.querySelector('.label').innerText = option.text;
    }
  }

  function findSelected(questions) {
    for (var i = 0; i < questions.length; ++i) {
      if (questions[i].selected) {
        return questions[i];
      }
    }
  }

  function findByValue(value) {
    for (var i = 0; i < questions.length; ++i) {
      if (questions[i].value === value) {
        return questions[i];
      }
    }
  }
}

function toOptionHTML(option) {
  var selected = option.selected ? ' selected ' : '';
  return '  <option value="' + option.value + '"' + selected + '>' + option.text + '</option>';
}
