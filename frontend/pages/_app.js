import Layout from "../components/Layout";

import React from "react";
import App, { Container } from "next/app";

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

//

export default class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    let isAuthenticated = false;
    return (
      <Container>
        <Layout {...pageProps}>
          <Component {...pageProps}/>
        </Layout>
      </Container>
    );
  }
}