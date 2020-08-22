import React from "react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

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
        <script
          data-ad-client="ca-pub-9036577259588469"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        />
      </Head>
      <Header user={props.socket.user}/>
      {child}
      {footer}
    </div>
  );
};