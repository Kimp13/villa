import Link from "next/link";

import IntroductionDiv from "../components/IntroductionDiv";
import ChangingBackgrounds from "../components/ChangingBackgrounds";
import Loader from "../components/Loader";
import AnonymousAnnouncement from "../components/AnonymousAnnouncement";

import { getApiResponse, getFullLink } from "../libraries/requests";
import { shortenTextTo } from "../libraries/texts";

import style from "../public/styles/pages/index.module.scss";
console.log(style);

export async function getStaticProps() {
  const rooms = await getApiResponse('villa/getRooms', {_sort: 'id:asc'}),
        main = rooms.shift();

  return {
    props: {
      main,
      rooms,
      title: 'Главная',
      footerEnabled: true
    }
  }
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    let roomsBackgrounds = new Array();

    for (let i = 0; i < this.props.rooms.length; i += 1) {
      for (let j = 0; j < this.props.rooms[i].images.length; j += 1) {
        roomsBackgrounds.push({
          url: this.props.rooms[i].images[j].medium,
          width: this.props.rooms[i].images[j].width,
          height: this.props.rooms[i].images[j].height,
          caption: this.props.rooms[i].name
        });
      }
    }

    this.state = {
      roomsBackgrounds,
      contentImagesHeight: 0
    };

    this.firstCaption = React.createRef();
    this.secondCaption = React.createRef();
  }

  render() {
    return (
      <main className="main">
        <IntroductionDiv content={this.props.main}/>
        <article className="main-adwords">
          <section className="main-adwords-section">
            <h2 className="main-adwords-section-header">
              Наши номера
            </h2>
            <div className="main-adwords-section-content">
              <p className="main-adwords-section-content-description">
                Они такие хорошие, такие классные, оооо да!<br />
                <Link href="rooms/index.js" as="/rooms">
                  <a className="a">
                    Хотите увидеть больше?
                  </a>
                </Link>
              </p>
              <div className="main-adwords-section-content-images">
                <ChangingBackgrounds
                  backgrounds={this.state.roomsBackgrounds}
                  captionEnabled={true}
                />
              </div>
            </div>
          </section>
          <section className="main-adwords-section">
            <h2 className="main-adwords-section-header">
              У нас любвеобильные администраторы
            </h2>
          </section>
          <section className="main-adwords-section">
            <h2 className="main-adwords-section-header">
              У нас отличные отзывы
            </h2>
          </section>
          <section className="main-adwords-section">
            <h2 className="main-adwords-section-header">
              И, наконец, у нас просто запас хорошего настроения на все времена!
            </h2>
          </section>
        </article>
      </main>
    );
  }
}
