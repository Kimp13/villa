import "../public/styles/libraries/forms.module.scss";

export function showError(form, fieldIndex, description) {
  let i = 0,
      field = form[fieldIndex];
  while (form.children[i].nodeName === 'DIV') {
    if (form.children[i].getAttribute('data-index') === fieldIndex.toString()) {
      form.children[i].innerHTML = description;
      return;
    }
    i += 1;
  }
  let error = document.createElement('div');
  error.setAttribute('data-index', fieldIndex);
  error.classList.add('form-error');
  error.innerHTML = description;
  error.onclick = function() {
    field.focus();
  };
  field.oninput = function() {
    error.remove();
    field.oninput = null;
  }
  form.prepend(error);
}