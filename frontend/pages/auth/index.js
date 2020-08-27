import React from "react";
import Head from "next/head";
import Loader from "../../components/Loader";

import { showError } from "../../libraries/forms.js";
import { setCookie, deleteCookie } from "../../libraries/cookies.js";
import { getFullLink } from "../../libraries/requests.js";

import "../../public/styles/pages/auth/index.module.scss";
import "../../public/styles/libraries/forms.module.scss";

export default class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };
  }

  componentDidUpdate() {
    if (this.state.firstTime) {
      this.state.firstTime = false;
      if (this.props.socket.user.isAnonymous) {
        let form = document
                    .getElementsByClassName('authorization-main')[0]
                    .children[1];

        form[0].value = this.props.socket.user.name;
        form[1].value = this.props.socket.user.surname;
      }
    }

    if (this.state.loaded) {
      let container = document.getElementsByClassName('authorization-main')[0],
          form;

      if (this.state.isSignin) {
        form = container.children[0];
        form.classList.remove('left');
        form.nextElementSibling.classList.add('right');
      } else {
        form = container.children[1];
        form.classList.remove('right');
        form.previousElementSibling.classList.add('left');
      }

      container.style.height = form.offsetHeight + 'px';
    }
  }

  switchForm() {
    this.setState((state, props) => {
      state.isSignin = !state.isSignin;
      return state;
    });
  }

  checkUserSave() {
    let checkbox = document.getElementsByClassName('checkbox')[0];
    if (checkbox.classList.contains('checked')) {
      checkbox.classList.remove('checked');
    } else {
      checkbox.classList.add('checked');
    }
  }

  startRegistration(event) {
    event.preventDefault();

    let form = event.target.parentNode,
        element = form.parentNode.previousElementSibling,
        regex = /[^А-яЁё]/,
        valid = true;

    if (form[0].value.length === 0) {
      showError(form, 0, "Введите имя.", true);
      valid = false;
    } else if (regex.test(form[0].value)) {
      showError(form, 0, "Имя может состоять только из русских букв.", true);
      valid = false;
    }

    if (form[1].value.length === 0) {
      showError(form, 0, "Введите фамилию.", true);
      valid = false;
    } else if (regex.test(form[1].value)) {
      showError(form, 1, "Фамилия может состоять только из русских букв.", true);
      valid = false;
    }

    if (valid === false) {
      window.requestAnimationFrame(() => {
        form.parentNode.style.height = form.offsetHeight + 'px';
      });
      return;
    }

    while (element !== null) {
      element.classList.add('hidden');
      element = element.previousElementSibling;
    }

    form.classList.add('left');
    form.nextElementSibling.classList.remove('right');

    form.parentNode.style.height = form.nextElementSibling.offsetHeight + 'px';
  }

  endRegistration(event) {
    event.preventDefault();

    let form = event.target;

    form.style.position = '';

    while (form.nodeName !== 'FORM') {
      form = form.parentNode; 
    }

    let element = form.parentNode.previousElementSibling;

    while (element !== null) {
      element.classList.remove('hidden');
      element = element.previousElementSibling;
    }

    form.classList.add('right');
    form.previousElementSibling.classList.remove('left');

    form.parentNode.style.height = form.previousElementSibling.offsetHeight + 'px';
  }

  signIn(event) {
    event.preventDefault();

    let form = event.target.parentNode,
        usernameField = form[0],
        passwordField = form[1],
        username = usernameField.value,
        password = passwordField.value,
        usernameRegEx = /[^a-zA-Z0-9$%^*_-]/,
        formValid = true;

    form[form.length - 1].style.display = 'none';

    if (username.length === 0) {
      showError(form, 0, 'Введите логин.', true);
      formValid = false;
    } else if (usernameRegEx.test(username)) {
      showError(form, 0, 'Недопустимые символы в логине.', true);
      formValid = false;
    }

    if (password.length === 0) {
      showError(form, 1, 'Введите пароль.', true);
      formValid = false;
    } else if (password.length < 8) {
      showError(form, 1, 'Пароль слишком короткий.', true);
      formValid = false;
    }

    if (formValid) {
      fetch(getFullLink('/auth/local'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: username,
          password
        })
      }).then(response => response.json())
        .then(response => {
          if (response.error) {
            showError(form, 1, 'Неправильный логин или пароль.', true);
            window.requestAnimationFrame(() => {
              form.parentNode.style.height = form.offsetHeight + 'px';
            });
            form[form.length - 1].style.display = '';
          } else {
            if (form[2].checked) {
              setCookie('jwt', response.jwt, { maxAge: 1209600 });
            } else {
              setCookie('jwt', response.jwt);
            }
            window.location.href = '/';
          }
        });
    } else {
      window.requestAnimationFrame(() => {
        form.parentNode.style.height = form.offsetHeight + 'px';
      });
    }
  }

  signUp(event) {
    event.preventDefault();

    let form = event.target.parentNode,
        bb = form[0],
        valid = true;

    form[0].remove();

    if (form[0].value.length === 0) {
      showError(form, 0, "Введите адрес электронной почты.", true);
      valid = false;
    } else if (!(/^\w+@\w+\.\w{2,}$/.test(form[0].value))) {
      showError(form, 0, "Некорректный формат электронной почты.", true);
      valid = false;
    }

    if (form[1].value.length === 0) {
      showError(form, 1, "Введите логин.", true);
      valid = false;
    } else if (/[^a-zA-Z0-9$%^*_-]/.test(form[1].value)) {
      showError(
        form,
        1,
        "Логин может состоять только из русских, английских букв," +
        " цифр и знаков $, %, ^, *, _, -.",
        true
      );
      valid = false;
    }

    if (form[2].value.length === 0) {
      showError(form, 2, "Введите пароль.", true);
      valid = false;
    } else if (form[2].value.length < 8) {
      showError(form, 2, "Пароль слишком короткий.", true);
    } else if (form[2].value !== form[2].value) {
      showError(form, 3, "Пароли не совпадают.", true);
      valid = false;
    }

    form.prepend(bb);

    if (valid === false) {
      window.requestAnimationFrame(() => {
        form.parentNode.style.height = form.offsetHeight + 'px';
      });
      return;
    }

    form[form.length - 1].style.display = 'none';

    let body = new Object();

    if (this.props.socket.user.isAnonymous) {
      body.anon = this.props.socket.user.id;
    }

    fetch(getFullLink('villa/signUp'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.assign(body, {
        name: form.previousElementSibling[0].value,
        surname: form.previousElementSibling[1].value,
        email: form[1].value,
        username: form[2].value,
        password: form[3].value
      }))
    })
      .then(data => {
        if (data.ok) {
          deleteCookie('jwta');
          setCookie('jwt', data.statusText, { maxAge: 1209600 });
          window.location.href = '/';
        } else if (data.status === 403) {
          form[0].remove();
          if (data.statusText === 'e') {
            showError(form, 0, "Этот email уже занят.");
          } else {
            showError(form, 1, "Этот логин уже занят.");
          }
          form.prepend(bb);
          window.requestAnimationFrame(() => {
            form.parentNode.style.height = form.offsetHeight + 'px';
          });
        } else {
          form[0].remove();
          showError(form, -1, "Что-то пошло не так. Попробуйте позже.");
        }
      });
  }

  render() {
    if (this.props.socket.user) {
      if (this.state.loaded) {
        let title = 'Авторизация';
        if (this.state.isSignin) {
          title = 'Вход | Villa Guest House на Фиоленте';
          history.replaceState(null, '', '/auth?type=signin');
        } else {
          title = 'Регистрация | Villa Guest House на Фиоленте';
          history.replaceState(null, '', '/auth?type=signup');
        }

        return (
          <React.Fragment>
            <Head>
              <title>{title}</title>
            </Head>
            <div className="authorization">
              <div
                className={
                  "authorization-content form-switcher" +
                  (this.state.isSignin ? ' active' : '')
                }
                onClick={this.state.isSignin ? null : this.switchForm}
              >
                Вход
              </div>
              <div
                className={
                  "authorization-content form-switcher" + 
                  (this.state.isSignin ? '' : ' active')
                }
                onClick={this.state.isSignin ? this.switchForm : null}
              >
                Регистрация
              </div>
              <div className={
                "authorization-content form-switcher-underline" + 
                (this.state.isSignin ? '' : ' right')
              } 
              />
              <div className="authorization-main">
                <form className="form">
                  <input
                    className="keyboard-input input"
                    type="text"
                    name="username"
                    maxLength="64"
                    placeholder="Логин"
                    autoComplete="username"
                  />
                  <input
                    className="keyboard-input input"
                    type="password"
                    name="password"
                    maxLength="128"
                    placeholder="Пароль"
                    autoComplete="current-password"
                  />
                  <label className="label" htmlFor="saveuser-checkbox">
                    <input
                      className="input"
                      type="checkbox"
                      name="saveuser"
                      id="saveuser-checkbox"
                      onClick={this.checkUserSave} 
                    />
                    <div className="checkbox">
                      <i className="fas fa-check" />
                    </div>
                    Запомнить меня
                  </label>
                  <input className="submit input" value="Вход" onClick={this.signIn} />
                </form>
                <form className="form">
                  <input
                    className="keyboard-input input"
                    type="text"
                    name="name"
                    maxLength="64"
                    placeholder="Имя"
                    autoComplete="name"
                  />
                  <input
                    className="keyboard-input input"
                    type="text"
                    name="surname"
                    maxLength="128"
                    placeholder="Фамилия"
                    autoComplete="name"
                  />
                  <input
                    className="submit input"
                    value="Продолжить"
                    onClick={this.startRegistration}
                  />
                </form>
                <form className="right form">
                  <button className="button" type="button" onClick={this.endRegistration}>
                    <i className="fas fa-arrow-left" />
                  </button>
                  <input
                    className="keyboard-input input"
                    type="text"
                    name="email"
                    maxLength="256"
                    placeholder="Электронная почта"
                    autoComplete="email"
                  />
                  <input
                    className="keyboard-input input"
                    type="text"
                    name="username"
                    maxLength="64"
                    placeholder="Логин"
                    autoComplete="username"
                  />
                  <input
                    className="keyboard-input input"
                    type="password"
                    name="password"
                    maxLength="128"
                    placeholder="Пароль"
                    autoComplete="new-password"
                  />
                  <input
                    className="keyboard-input input"
                    type="password"
                    name="password-repeat"
                    maxLength="128"
                    placeholder="Повтор пароля"
                    autoComplete="new-password"
                  />
                  <input
                    className="submit input"
                    value="Зарегистрироваться"
                    onClick={this.signUp}
                  />
                </form>
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        this.setState((state, props) => {
          state.isSignin = (window.location.search !== '?type=signup');
          state.firstTime = true;
          state.loaded = true;

          if (
            this.props.socket.user.isAuthenticated &&
            !this.props.socket.user.isAnonymous
          ) {
            window.location.href = '/profile';
          }

          this.componentDidUpdate = this.componentDidUpdate.bind(this);
          this.switchForm = this.switchForm.bind(this);
          this.signUp = this.signUp.bind(this);

          return state;
        });
      }
    }

    return <Loader />;
  }
}