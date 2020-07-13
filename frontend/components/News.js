import React from "react";

import "../public/styles/components/news.module.scss";

export default class News extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let news = Array();
    return (
      <div className="news-container">
        <h2>
          Новости
        </h2>
        {news}
      </div>
    );
  }
}