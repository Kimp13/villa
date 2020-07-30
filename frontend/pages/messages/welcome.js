import React from "react";

import { showError } from "../../libraries/forms.js";
import { setCookie } from "../../libraries/cookies.js";

import "../../public/styles/pages/messages/welcome.module.scss";

export async function getStaticProps() {
  return {
    props: {
      title: 'Добро пожаловать!'
    }
  }
}

class Welcome extends React.Component {
  constructor(props) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.checkCurrentForm = this.checkCurrentForm.bind(this);
    this.completeRegistration = this.completeRegistration.bind(this);
    this.moveForwards = this.moveForwards.bind(this);
    this.moveBackwards = this.moveBackwards.bind(this);

    this.headers = [
      'Добро пожаловать на Виллу! Похоже, Вы у нас впервые. ' +
      'Пожалуйста, введите номер телефона, чтобы мы могли подтвердить бронирование.',
      'Отлично! Теперь, если хотите, можете ввести свои имя и фамилию. ' +
      'Если не хотите, просто нажмите "Завершить".'
    ];

    this.forms = [
      [
        {
          element: <input
                     name="phoneNumber"
                     type="tel" key={0}
                     placeholder="Номер телефона"
                     autoComplete="on"
                   />,
          checkFunction: value => (value.length === 0 ? {
              valid: false,
              message: 'Введите номер телефона'
            } : (/[^+0-9]/.test(value) ? {
              valid: false,
              message: 'Номер телефона может состоять только из цифр и знака "+"'
            } : {
              valid: true
            }))
        }
      ],
      [
        {
          element: <input name="name" type="text" key={0} placeholder="Имя" />,
          checkFunction: value => (/[^А-яёЁ]/.test(value) ? {
              valid: false,
              message: 'Имя может состоять только из русских букв.'
            } : {
              valid: true
            })
        },
        {
          element: <input name="surname" type="text" key={1} placeholder="Фамилия" />,
          checkFunction: value => (/[^А-яёЁ]/.test(value) ? {
              valid: false,
              message: 'Фамилия может состоять только из русских букв.'
            } : {
              valid: true
            })
        }
      ]
    ];
  }

  componentDidMount() {
    window.addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
        if (this.state.index === this.headers.length - 1) {
          this.completeRegistration();
        } else {
          this.moveForwards();
        }
      }
    });
    if (this.props.socket.user.isAuthenticated) {
      window.location.href = '/messages';
    } else {
      this.setState({
        index: 0
      });
    }
  }

  checkCurrentForm() {
    let currentForm = document.getElementsByClassName('welcome-form')[this.state.index],
        formValid = true;

    for (let i = 0; i < this.forms[this.state.index].length; i += 1) {
      let checkResult =
        this.forms[this.state.index][i].checkFunction(currentForm[i].value);
      if (!checkResult.valid) {
        formValid = false;
        showError(currentForm, i, checkResult.message);
      }
    }

    return formValid;
  }

  completeRegistration() {
    if (this.checkCurrentForm()) {
      let forms = document.getElementsByClassName('welcome-form'),
          requestBody = '',
          firstBooking = window.localStorage.getItem('firstBooking');
      for (let i = 0; i < forms.length; i += 1) {
        for (let j = 0; j < forms[i].length; j += 1) {
          if (forms[i][j].value.length > 0) {
            let key = forms[i][j].name,
                value = forms[i][j].value;

            if (value.length > 1) {
              value = encodeURI(
                        value.charAt(0).toUpperCase() +
                        value.substring(1).toLowerCase()
                      );
            } else {
              value = encodeURI(value.toUpperCase());
            }

            if (requestBody) {
              requestBody += '&' + key + '=' + value;
            } else {
              requestBody += key + '=' + value;
            }
          }
        }
      }

      if (firstBooking) {
        if (requestBody) {
          requestBody += '&';
        }
        requestBody += 'firstBooking=' + encodeURI(firstBooking);
      }

      fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:1337') +
        '/villa-user-management/initializeNewAnonymous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      })
        .then(response => {
          if (!response.ok) {
            alert(requestBody);
            throw new Error();
          } else {
            return response.json();
          }
        })
        .then(json => {
          setCookie('a', json.id);
          window.location.href = '/messages';
        })
        .catch(e => window.location.href = '/');
    }
  }

  moveForwards() {
    if (this.checkCurrentForm()) {
      this.setState({
        index: this.state.index + 1
      });
    }
  }

  moveBackwards() {
    this.setState({
      index: this.state.index - 1
    });
  }

  render() {
    if (this.state) {
      let i = 0,
          forms = [],
          firstButton,
          lastButton;

      if (this.state.index === 0) {
        firstButton = (
          <button className="welcome-button-backwards inactive">
            <i className="fas fa-arrow-left" />
          </button>
        );
        lastButton = (
          <button
            type="button"
            className="welcome-button-forwards"
            onClick={this.moveForwards}
          >
            Далее
          </button>
        );
      } else if (this.state.index === this.headers.length - 1) {
        firstButton = (
          <button className="welcome-button-backwards" onClick={this.moveBackwards} >
            <i className="fas fa-arrow-left" />
          </button>
        );
        lastButton = (
          <button
            type="button"
            className="welcome-button-forwards"
            onClick={this.completeRegistration}
          >
            Завершить
          </button>
        );
      } else {
        firstButton = (
          <button className="welcome-button-backwards" onClick={this.moveBackwards} >
            <i className="fas fa-arrow-left" />
          </button>
        );
        lastButton = (
          <button
            type="button"
            className="welcome-button-forwards"
            onClick={this.moveForwards}
          >
            Далее
          </button>
        );
      }

      let fields;

      for (i; i < this.state.index; i += 1) {
        fields = Array();
        for (let j = 0; j < this.forms[i].length; j += 1) {
          fields.push(this.forms[i][j].element);
        }
        forms.push(
          <form className="welcome-form left" key={i}>
            <p>{this.headers[i]}</p>
            {fields}
          </form>
        );
      }
      fields = Array();
      for (let j = 0; j < this.forms[i].length; j += 1) {
        fields.push(this.forms[i][j].element);
      }
      forms.push(
        <form className="welcome-form" key={i}>
          <p>{this.headers[i++]}</p>
          {fields}
        </form>
      );
      for (i; i < this.headers.length; i += 1) {
        fields = Array();
        for (let j = 0; j < this.forms[i].length; j += 1) {
          fields.push(this.forms[i][j].element);
        }
        forms.push(
          <form className="welcome-form right" key={i}>
            <p>{this.headers[i++]}</p>
            {fields}
          </form>
        );
      }
      return (
        <div className="welcome">
          { firstButton }
          <div className="welcome-form-container">
            { forms }
          </div>
          { lastButton }
        </div>
      );
    }
    return null;
  }
}

export default Welcome;