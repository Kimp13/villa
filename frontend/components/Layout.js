import React from "react";
import Head from "next/head";
import Header from "../components/Header";

import "../public/styles/components/layout.module.scss";

export default function(props) {
  const child = React.cloneElement(props.children, {socket: props.socket}),
        title = props.title ?
                  <title>
                    {props.title + ' | Villa Guest House на Фиоленте'}
                  </title> :
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
        <link href="https://fonts.googleapis.com/css2?family=Pangolin&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Sail&display=swap" rel="stylesheet" />
      </Head>
      <Header user={props.socket.user}/>
      {child}
    </div>
  );
};