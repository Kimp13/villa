import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import IntroductionDiv from "../components/IntroductionDiv";
import Rooms from "../components/Rooms";
import Loader from "../components/Loader";
import { getFullLink, getAPIResponse } from "../libraries/requests";

import "../public/styles/index.scss";

async function getServerSideProps() {
  let main = await getAPIResponse('/rooms', [{key: 'name', value: 'Villa'}]),
      rooms = await getAPIResponse('/rooms', [{key: 'isUtility', value: false}]),
      news = [];
  return {
    props: {
      main: main[0],
      rooms: rooms,
      news: news
    }
  }
}

class News extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="news-container">
        <h2>
          Новости
        </h2>
      </div>
    );
  }
}

export { getServerSideProps };

export default ({ main, rooms, news }) => {
  return (
    <>
      <Head>
        <title>
          Главная | Villa Guest House
        </title>
      </Head>
      <IntroductionDiv content={main}/>
      <div className="content-flex-wrapper">
        <Rooms content={rooms} />
        <News content={news} />
      </div>
    </>
  );
};