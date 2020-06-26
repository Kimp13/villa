import React from "react";
import Head from "next/head";
import Header from "../components/Header";
import { Container } from "next/app";

import "../public/styles/layout.scss";

class Layout extends React.Component {
  constructor(props) {
    super(props);
  }
  static async getInitialProps({ req }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }
  render() {
    const { children } = this.props;
    const title = "Yack!";
    return (
      <div>
        <Head>
          <title>{title}</title>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <link href="https://fonts.googleapis.com/css2?family=Pangolin&display=swap" rel="stylesheet" />
          <script src="https://kit.fontawesome.com/0a9e08bc03.js" crossOrigin="anonymous" />
        </Head>
        <Header />
        <Container>{children}</Container>
      </div>
    );
  }
}

export default Layout;