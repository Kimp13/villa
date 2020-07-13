import React from "react";
import Layout from "../components/Layout";
import IntroductionDiv from "../components/IntroductionDiv";
import Rooms from "../components/Rooms";
import News from "../components/News";
import { getFullLink, getAPIResponse } from "../libraries/requests";

import "../public/styles/pages/index.module.scss";

export async function getServerSideProps() {
  let allRooms = await getAPIResponse('/rooms', []),
      news = await getAPIResponse('/news', []),
      actualRooms = Array(),
      Villa;

  for (let i = 0; i < allRooms.length; i += 1) {
    if (allRooms[i].isUtility)
      Villa = allRooms[i];
    else
      actualRooms.push(allRooms[i]);
  }

  return {
    props: {
      main: Villa,
      rooms: actualRooms,
      news: news,
      title: 'Главная'
    }
  }
}

export default ({ main, rooms, news }) => {
  return (
    <>
      <IntroductionDiv content={main}/>
      <div className="content-flex-wrapper">
        <Rooms content={rooms} />
        <News content={news} />
      </div>
    </>
  );
};