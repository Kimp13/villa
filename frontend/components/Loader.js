import React from "react";
import Head from "next/head";

import "../public/styles/loader.scss";

export default class Loader extends React.Component {
  constructor(props) {
    super(props);
    this.animationDuration = props.animationDuration;
  }

  render() {
    let loaderParts = Array();
    for (let i = 0; i < 3; i += 1) {
      let styleObject = {
        animationDuration: this.animationDuration + 's',
        animationDelay: i / 10 + 's'
      }
      loaderParts.push(<div className="loader-part" key={i} style={styleObject} />);
    }
    return (
      <div className="loader" >
        {loaderParts}
      </div>
    )
  }
}