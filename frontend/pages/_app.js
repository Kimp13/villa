import Layout from "../components/Layout";

import React from "react";
import App, { Container } from "next/app";

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
    console.log(this.props);
    let isAuthenticated = false;
    return (
      <Container>
        <Layout isAuthenticated={isAuthenticated} {...pageProps}>
          <Component {...pageProps}/>
        </Layout>
      </Container>
    );
  }
}