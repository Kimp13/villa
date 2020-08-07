import IntroductionDiv from "../components/IntroductionDiv";
import Rooms from "../components/Rooms";
import News from "../components/News";
import { getApiResponse, getFullLink } from "../libraries/requests";

export async function getStaticProps() {
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
      title: 'Главная',
      footerEnabled: true
    }
  }
}

export default function({ main }) {
  return (
    <main>
      <IntroductionDiv content={main}/>
      <div className="content-flex-wrapper">
        <Rooms/>
        <News/>
      </div>
      <div className="content-flex-wrapper">
        <div className="yandex-map">
          <h2>Карта</h2>
          <iframe src="https://yandex.ru/map-widget/v1/-/CCQpZDwAHA"/>
        </div>
        <div className="yandex-reviews">
          <h2>Отзывы</h2>
          <iframe src="https://yandex.ru/maps-reviews-widget/5012059488?comments"/>
        </div>
      </div>
    </main>
  );
};