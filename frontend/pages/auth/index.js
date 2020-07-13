import React from "react";
import Head from "next/head";

import { showError } from "../../libraries/forms.js";
import { setCookie } from "../../libraries/cookies.js";

import "../../public/styles/pages/auth/index.module.scss";

export default class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignin: null
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.switchForm = this.switchForm.bind(this);
  }

  componentDidMount() {
    this.setState({
      isSignin: (window.location.search !== '?type=signup'),
      mounted: true
    });
  }

  switchForm() {
    this.setState({
      isSignin: !this.state.isSignin,
      mounted: true
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

  signIn(event) {
    event.preventDefault();

    let form = event.target.parentNode,
        usernameField = form[0],
        passwordField = form[1],
        username = usernameField.value,
        password = passwordField.value,
        usernameRegEx = /[^a-zA-Z1-9$%^*_-]/,
        formValid = true;

    form[3].style.display = 'none';

    if (username.length === 0) {
      showError(form, usernameField, 0, 'Введите логин.');
      formValid = false;
    } else if (usernameRegEx.test(username)) {
      showError(form, usernameField, 0, 'Недопустимые символы в логине.');
      formValid = false;
    }
    if (password.length === 0) {
      showError(form, passwordField, 1, 'Введите пароль.');
      formValid = false;
    } else if (password.length < 8) {
      showError(form, passwordField, 1, 'Пароль слишком короткий.');
      formValid = false;
    }
    if (formValid) {
      fetch('http://localhost:1337/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: username,
          password: password
        })
      }).then(response => response.json())
        .then(response => {
          if (response.error) {
            showError(form, passwordField, 1, 'Неправильный логин или пароль.');
          } else {
            if (form[2].checked) {
              setCookie('jwt', response.jwt, { maxAge: 1209600 });
            } else {
              setCookie('jwt', response.jwt);
            }
            window.location.href = '/';
          }
          form[3].style.display = '';
        });
    } else {
      form[3].style.display = '';
    }

  }

  render() {
    if (!this.state.mounted) {
      return null;
    } else {
      let title = 'Авторизация';
      if (this.state.isSignin) {
        title = 'Вход | Villa Guest House на Фиоленте';
        history.replaceState(null, '', '/auth?type=signin');
      } else {
        title = 'Регистрация | Villa Guest House на Фиоленте';
        history.replaceState(null, '', '/auth?type=signup');
      }
      return (
        <>
          <Head>
            <title>{title}</title>
          </Head>
          <div className="authorization">
            <div className={"form-switcher" + (this.state.isSignin ? ' active' : '')} onClick={this.state.isSignin ? null : this.switchForm}>
              Вход
            </div>
            <div className={"form-switcher" + (this.state.isSignin ? '' : ' active')} onClick={this.state.isSignin ? this.switchForm : null}>
              Регистрация
            </div>
            <div className={"form-switcher-underline" + (this.state.isSignin ? '' : ' right')} />
            <div className={"authorization-main" + (this.state.isSignin ? '' : ' right')}>
              <form>
                <input className="keyboard-input" type="text" name="username" maxLength="64" placeholder="Логин" autoComplete="username" />
                <input className="keyboard-input" type="password" name="password" maxLength="128" placeholder="Пароль" autoComplete="current-password" />
                <label htmlFor="saveuser-checkbox">
                  <input type="checkbox" name="saveuser" id="saveuser-checkbox" onClick={this.checkUserSave} />
                  <div className="checkbox">
                    <i className="fas fa-check" />
                  </div>
                  Запомнить меня
                </label>
                <input type="submit" value="Вход" onClick={this.signIn} />
              </form>
              <form>
                Форма регистрации
              </form>
            </div>
          </div>
        </>
      );
    }
  }
}