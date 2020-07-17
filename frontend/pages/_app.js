import React from "react";
import App from "next/app";

import io from "../../backend/node_modules/socket.io-client/dist/socket.io.dev.js";

import Layout from "../components/Layout";

import { getCookie, setCookie } from "../libraries/cookies.js";
import { getAPIResponse } from "../libraries/requests.js";

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

export default class MyApp extends App {
  static async getInitialProps({ ctx }) {
    return {
      pageProps: {},
      user: {
        isAuthenticated: false
      }
    };
  }

  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    const socket = io.connect('localhost:1337');
    socket.on('user', user => {
      socket.user = user;
      this.setState({
        socket
      });
    });
  }

  render() {
    if (this.state) {
      let { Component, pageProps } = this.props,
          socket = this.state.socket;

      return (
        <Layout socket={socket} {...pageProps}>
          <Component {...pageProps}/>
        </Layout>
      );
    } else {
      return null;
    }
  }
}