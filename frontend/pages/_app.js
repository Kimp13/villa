import React from "react";
import App from "next/app";
import Layout from "../components/Layout";
import Loader from "../components/Loader";

import { getApiResponse } from "../libraries/requests";
import io from "../../backend/node_modules/socket.io-client/dist/socket.io.slim.js";

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

import "../public/styles/components/layout.scss";

export default class MyApp extends App {
  constructor(props) {
    super(props);

    this.state = {
      socket: {
        user: null
      }
    };

    getApiResponse('/villa/getUser')
      .then(user => {
        this.setState(state => {
          state.socket = {
            user
          };

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
