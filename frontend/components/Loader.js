import React from "react";

import "../public/styles/components/loader.module.scss";

export default class Loader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let items = [],
        animationDuration = `${(this.props.animationDuration || 2000) / 1000}s`;

    for (let i = 0; i < (this.props.itemsCount || 4); i += 1) {
      items.push(
        <div className="loader-item" key={i} style={{
          animationDelay: `${i * (this.props.animationDelay || 100) / 1000}s`,
          animationDuration: animationDuration
        }} />
      );
    }

    return (
      <div className="loader">
        {items}
      </div>
    )
  }
}