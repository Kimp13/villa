import React from "react";
import App from "next/app";
import Layout from "../components/Layout";
import Loader from "../components/Loader";

import { getFullLink } from "../libraries/requests";
import io from "../../backend/node_modules/socket.io-client/dist/socket.io.js";

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';


import "../public/styles/components/footer.scss";
import "../public/styles/components/header.scss";
import "../public/styles/components/layout.scss";
import "../public/styles/pages/index.scss";

export default class MyApp extends App {
  constructor(props) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    const socket = io.connect(getFullLink('/'), {
      path: 'api/socket.io',
      transports: ['websocket']
    });
    socket.on('tokenExpired', e => {
      alert(e);
    });

    socket.on('user', user => {
      let element = document.getElementById('first-loading');
      element.style.opacity = '0';
      element.ontransitionend = function () {
        this.remove();
      };

      socket.off('tokenExpired');
      socket.user = user;
      this.setState((state, props) => {
        state = {socket};

        return state;
      });
    });
  }

  render() {
    let main;

    if (this.state) {
      let { Component, pageProps } = this.props,
          socket = this.state.socket;

      main = (
        <Layout socket={socket} {...pageProps}>
          <Component {...pageProps}/>
        </Layout>
      );
    } else {
      main = null;
    }

    return (
      <>
        <div id="first-loading" style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          zIndex: '9999',
          background: 'white',
          transition: 'opacity .3s ease'
        }}>
          <Loader />
        </div>
        {main}
      </>
    );
  }
}