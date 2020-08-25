import Link from "next/link";

import IntroductionDiv from "../components/IntroductionDiv";
import BackgroundWithSwitchers from "../components/BackgroundWithSwitchers";
import Loader from "../components/Loader";
import AnonymousAnnouncement from "../components/AnonymousAnnouncement";

import { getApiResponse, getFullLink } from "../libraries/requests";
import { shortenTextTo } from "../libraries/texts";

export async function getStaticProps() {
  const rooms = await getApiResponse('villa/getRooms', {_sort: 'id:asc'}),
        main = rooms.shift();

  return {
    props: {
      main,
      title: 'Главная',
      footerEnabled: true
    }
  }
}

export default function({ main, socket }) {
  return (
    <main>
      <IntroductionDiv content={main}/>
    </main>
  );
}
