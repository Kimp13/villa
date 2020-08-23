import React from "react";
import Head from "next/head";
import Link from "next/link";
import Loader from "./Loader";

export default function(props) {
  const child = React.cloneElement(props.children, {socket: props.socket}),
        title = props.title ?
                  <title>
                    {props.title + ' | Villa Guest House на Фиоленте'}
                  </title> :
                null,
        footer = props.footerEnabled ?
                  <Footer /> :
                 null;

  return (
    <div>
      <Head>
        {title}
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
        <link rel="icon" type="image/x-icon" href="favicon.ico" />
      </Head>
      <Header user={props.socket.user}/>
      {child}
      {footer}
    </div>
  );
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      opened: false
    }
    
    this.componentDidUpdate = this.underlineAnchors;
    this.componentDidMount = this.underlineAnchors;

    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  underlineAnchors() {
    let anchors = document.getElementById('header').querySelectorAll('a');
    for (let anchor of anchors) {
      if (
        anchor.classList.contains('underlined') &&
        anchor.lastChild.nodeName !== 'DIV'
      ) {
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
    let header = document.getElementsByTagName('header')[0];

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
        headerFunction = this.state.opened ? null : this.handleButtonClick,
        firstLinks = [];

    if (this.props.user) {
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
    } else {
      firstLinks.push(<Loader key="l" />);
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

function Footer () {
  let linkRegExp = /(https?:\/\/)?\w+\.[a-z]{2,}(\/(\w|%[\dA-F]{2})*)*/g;
  return (
    <footer>
      <div className="footer-ads">
        <p>
          <i className="fab fa-whatsapp" />
          <a target="_blank" href="https://api.whatsapp.com/send?phone=79534081000">
            +79534081000
          </a>
        </p>
        <p>
          <i className="fab fa-viber" />
          <a target="_blank" href="viber://chat/?number=%2B79534081000">
            +79534081000
          </a>
        </p>
        <p>
          <i className="fas fa-phone" />
          <a target="_blank" href="tel:79785766940">
            +79785025000
          </a>
        </p>
        <p>
          <span className="icon">B</span>
          <a target="_blank" href="https://www.booking.com/hotel/xc/villa-guest-house">
            Booking
          </a>
        </p>
      </div>
      <div className="footer-waves">
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
      </div>
    </footer>
  );
};