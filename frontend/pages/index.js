import IntroductionDiv from "../components/IntroductionDiv";
import Rooms from "../components/Rooms";
import News from "../components/News";
import { getApiResponse, getFullLink } from "../libraries/requests";

import "../public/styles/pages/index.module.scss";

export async function getServerSideProps() {
  let Villa = (await getApiResponse('/rooms', {
    name: 'Villa'
  }))[0];

  for (let i = 0; i < Villa.images.length; i += 1) {
    Villa.images[i] = {
      url: getFullLink(Villa.images[i].url),
      width: Villa.images[i].width,
      height: Villa.images[i].height
    };
  }

  Villa = {
    name: Villa.name,
    header: Villa.header,
    description: Villa.description,
    images: Villa.images
  };

  return {
    props: {
      main: Villa,
      title: 'Главная'
    }
  }
}

export default function({ main }) {
  return (
    <>
      <IntroductionDiv content={main}/>
      <div className="content-flex-wrapper">
        <Rooms/>
        <News/>
      </div>
    </>
  );
};