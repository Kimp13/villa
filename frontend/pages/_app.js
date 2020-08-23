import React from "react";
import App from "next/app";
import Layout from "../components/Layout";
import Loader from "../components/Loader";

import { getFullLink } from "../libraries/requests";
import io from "../../backend/node_modules/socket.io-client/dist/socket.io.slim.js";

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

    this.state = {
      socket: {
        user: null
      }
    };

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    let apiUrl = /^(https?:\/\/)?(((\w+\.)+\w{2,})|localhost)(:\d{1,5})?/
          .exec(process.env.NEXT_PUBLIC_API_URL),
        path = process.env.NEXT_PUBLIC_API_URL
          .substring(apiUrl[0].length + apiUrl.index) + '/socket.io';

    const socket = io.connect(apiUrl[0], {path});

    socket.on('tokenExpired', e => {
      socket.off('user');
      
      alert('Срок вашей сессии иссяк. Войдите снова.');
      window.location.href = '/auth?type=signin';
    });

    socket.on('user', user => {
      socket.off('tokenExpired');
      socket.user = user;

      this.setState((state, props) => {
        state.socket = socket;

        return state;
      });
    });
  }

  render() {
    let { Component, pageProps } = this.props;

    return (
      <Layout socket={this.state.socket} {...pageProps}>
        <Component {...pageProps}/>
      </Layout>
    );
  }
}
