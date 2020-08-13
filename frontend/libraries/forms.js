export function showError(form, fieldIndex, description, changeParentHeight = false) {
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

  if (field !== undefined) {
    error.onclick = function() {
      field.focus();
    };

    field.oninput = function() {
      error.remove();
      if (form.childElementCount === form.length) {
        form[form.length - 1].style.display = '';
      }
      field.oninput = null;
      if (changeParentHeight) {
        window.requestAnimationFrame(() => {
          form.parentNode.style.height = form.offsetHeight + 'px';
        });
      }
    }
  }

  form.prepend(error);
}