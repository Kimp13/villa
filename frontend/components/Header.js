import React from "react";
import Link from "next/link";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      opened: false
    }

    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  componentDidMount() {
    let anchors = document.getElementById('header').querySelectorAll('a');
    for (let anchor of anchors) {
      if (anchor.classList.contains('underlined')) {
        let underline = document.createElement('div'),
            underlineText = document.createElement('p');
        underline.classList.add('underline');
        underlineText.innerHTML = anchor.innerHTML;
        underline.append(underlineText);
        anchor.append(underline);
      }
    };
  }

  handleButtonClick() {
    let header = document.querySelector('header');
    if (this.state.opened) {
      header.classList.remove('opened');
      header.children[0].classList.remove('hidden');
      header.children[1].classList.add('hidden');
      this.setState({opened: false});
    } else {
      header.classList.add('opened');
      header.children[0].classList.add('hidden');
      header.children[1].classList.remove('hidden');
      this.setState({opened: true});
    }
  }

  render() {
    let firstButtonClassName = 'header-open' + this.state.opened ? ' hidden' : '',
        secondButtonClassName = 'header-close' + this.state.opened ? '' : ' hidden',
        headerFunction = this.state.opened ? undefined : this.handleButtonClick,
        firstLinks = [];

    if (this.props.user.isAuthenticated) {
      firstLinks.push(
        <Link href="/messages" key={'a'}>
          <a className="underlined" onClick={this.handleButtonClick}>
            <i className="far fa-comments" />Сообщения
          </a>
        </Link>
      );
      firstLinks.push(
        <Link href="/auth/logout" key={'b'}>
          <a className="underlined" onClick={this.handleButtonClick}>
            <i className="fas fa-user-slash" />Выход
          </a>
        </Link>
      );
    } else {
      firstLinks.push(
        <Link href="/auth?type=signin" as="/auth" key={'a'}>
          <a className="underlined" onClick={this.handleButtonClick}>
            <i className="fas fa-user-check" />Вход / Регистрация
          </a>
        </Link>
      );
    }

    return (
      <header onClick={headerFunction}>
        <button className="header-open">
          <i className="fas fa-bars" />
          Меню
        </button>
        <button className="header-close hidden" onClick={this.handleButtonClick}>
          <i className="fas fa-times" />
        </button>
        <nav id="header">
          <div className="header-user-management">
            {firstLinks}
          </div>
          <Link href="/">
            <a className="header-logo" onClick={this.state.opened ? this.handleButtonClick : null}>
                <i className="fas fa-sun" />
                <span className="header-logo-main">
                  B
                </span>
                <p className="big">
                  Вилла
                </p>
            </a>
          </Link>
          <div className="header-villa-info">
            <Link href="/routes">
              <a className="underlined" onClick={this.handleButtonClick}>
                <i className="fas fa-car-side" />Как добраться
              </a>
            </Link>
          </div>
        </nav>
      </header>
    )
  }
}