import React from "react";
import Head from "next/head";
import Link from "next/link";
import Loader from "./Loader";

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      asideOpened: false
    };
  }

  componentDidMount() {
    const Slideout = require('slideout');

    let slideout = new Slideout({
      panel: document.getElementById('main-content'),
      menu: document.getElementsByTagName('aside')[0],
      padding: 256,
      tolerance: 70
    });

    this.setState(state => {
      state.slideout = slideout;

      return state;
    });

    slideout.on('beforeopen', () => {
      this.setState(state => {
        state.asideOpened = true;

        return state;
      });
    });

    slideout.on('beforeclose', () => {
      this.setState(state => {
        state.asideOpened = false;

        return state;
      });
    });
  }

  render() {
    const child = React.cloneElement(this.props.children, {socket: this.props.socket}),
          title = this.props.title ?
                    <title>
                      {this.props.title + ' | Villa Guest House на Фиоленте'}
                    </title> :
                  null,
          footer = this.props.footerEnabled ?
                    <Footer /> :
                   null;

    return (
      <React.Fragment>
        <Head>
          {title}
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <link rel="icon" type="image/x-icon" href="favicon.ico" />
        </Head>
        <Aside
          user={this.props.socket.user}
          opened={this.state.asideOpened}
          slideout={this.state.slideout}
        />
        <div id="main-content">
          {child}
          {footer}
        </div>
      </React.Fragment>
    );
  }
};

class Aside extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.props.slideout.toggle();
  }

  render() {
    let firstLinks = [];

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
      <React.Fragment>
        <button
          className={"aside-toggle" + (this.props.opened ? " opened" : "")}
          onClick={this.toggle}
        >
          <div className="aside-toggle-bar" />
          <div className="aside-toggle-bar" />
          <div className="aside-toggle-bar" />
          <p className="aside-toggle-caption">
            Меню
          </p>
        </button>
        <aside>
          <nav>
            <Link href="/">
              <a className="aside-logo">
                  <i className="fas fa-sun" />
                  <span className="aside-logo-main">
                    B
                  </span>
                  <p className="big">
                    Вилла
                  </p>
              </a>
            </Link>
            <div className="aside-villa-info">
              <Link href="/routes">
                <a className="underlined">
                  <i className="fas fa-car-side" />Как добраться
                </a>
              </Link>
            </div>
            <div className="aside-user-management">
              {firstLinks}
            </div>
          </nav>
        </aside>
      </React.Fragment>
    );
  }
}

function Footer () {
  let linkRegExp = /(https?:\/\/)?\w+\.[a-z]{2,}(\/(\w|%[\dA-F]{2})*)*/g;
  return (
    <footer>
      Вилла
      <div className="footer-waves">
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
      </div>
    </footer>
  );
};