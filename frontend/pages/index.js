import Link from "next/link";

import IntroductionDiv from "../components/IntroductionDiv";
import BackgroundWithSwitchers from "../components/BackgroundWithSwitchers";
import Loader from "../components/Loader";
import AnonymousAnnouncement from "../components/AnonymousAnnouncement";

import { getApiResponse, getFullLink } from "../libraries/requests";
import { shortenTextTo } from "../libraries/texts";

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

class OneNews extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      preview: shortenTextTo(props.data.text, 120, true),
      text: this
        .props
        .data
        .text
        .substring(3, this.props.data.text.length - 4)
    }

    this.toggle = this.toggle.bind(this);
  }

  toggle(event) {
    let target = event.target;

    while (target.classList.value !== 'news-container') {
      target = target.parentNode;
    }

    this.setState((state, props) => {
      if (state.opened) {
        document.documentElement.style.overflowY = 'auto';
        document.getElementsByClassName('content-flex-wrapper')[1].style.display = '';
        document.getElementsByTagName('footer')[0].style.display = '';
        target.style.overflowY = '';
        state.opened = false;
      } else {
        document.documentElement.style.overflowY = 'hidden';
        document.getElementsByClassName('content-flex-wrapper')[1].style.display = 'none';
        document.getElementsByTagName('footer')[0].style.display = 'none';
        target.style.overflowY = 'hidden';
        state.opened = true;
      }

      return state;
    });
  }

  render() {
    let classString = (this.state.opened ? " opened" : "");
    return (
      <div className={"opened-news-wrapper" + classString}>
        <div className="news" onClick={this.state.opened ? null : this.toggle}>
          <h3 className="news-header">
            {this.props.data.header}
          </h3>
          <p className="news-author">
            {this.props.data.author}
          </p> 
          <p 
            className="news-text" 
            dangerouslySetInnerHTML={{
              __html: this.state.opened ? this.state.text : this.state.preview
            }}
          />
          <button
            className="news-close"
            onClick={this.state.opened ? this.toggle : null}
          >
            <i className="fas fa-times" />
          </button>
        </div>
      </div>
    );
  }
}

class News extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      news: new Array(),
      count: 0,
      skip: 0,
      loading: true
    }

    getApiResponse('/news/count')
      .then(count => {
        if (count === 0) {
          this.setState((state, props) => {
            state.loading = false;

            return state;
          });
        } else {
          this.state.count = count;
          this.addNews();
        }
      });

    this.addNews = this.addNews.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }

  componentDidUpdate() {
    if (!this.state.scrollDisabled) {
      let element = document.getElementsByClassName('news-container');
      if (element.scrollHeight - element.offsetHeight - element.scrollTop < 20) {
        this.addNews();
      }
    }
  }

  addNews() {

    this.setState((state, props) => {
      state.loading = true;

      getApiResponse('/villa-user-management/getNews', {
        _start: this.state.skip,
        timezoneOffset: new Date().getTimezoneOffset() * 60000
      })
        .then(news => {
          this.setState((state, props) => {
            for (let i = 0; i < news.length; i += 1) {
              state.news.push(
                <OneNews data={news[i]} key={i + state.skip} />
              );
            }
            state.skip += 10;
            if (state.skip >= state.count) {
              state.scrollDisabled = true;
            }
            state.loading = false;
            return state;
          });
        });

      return state;
    });
  }

  checkScroll() {
    let element = document.getElementsByClassName('news-container');
    if (element.scrollHeight - element.offsetHeight - element.scrollTop < 20) {
      this.addNews();
    }
  }

  render() {
    let noNews = null,
        loader = null;

    if (this.state.count === 0 && !this.state.loading) {
      noNews = (
        <p className="news-content-null">
          Нет новостей
        </p>
      );
    } else if (this.state.loading) {
      loader = <Loader />;
    }

    return (
      <div
        className="news-container"
        onScroll={
          this.state.scrollDisabled ?
          null :
          this.checkScroll
        }
      >
        <h2>Новости</h2>
        <div className="news-content">
          {this.state.news}
        </div>
        {noNews}
        {loader}
      </div>
    );
  }
}

class Room extends React.Component {
  constructor(props) {
    super(props);

    this.description = 
      this.props.description ?
        shortenTextTo(this.props.description, 100) :
        "Описания нет";
  }

  render() {
    return (
      <div className="room">
        <h3>
          {this.props.name}
        </h3>
        <div className="room-photos-wrapper">
          <BackgroundWithSwitchers backgrounds={this.props.images} />
        </div>
        <p className="room-description">
          {this.description}
        </p>
        <Link href={'/room/[name]'} as={`/room/${this.props.name}`} >
          <a className="room-link">
            {
              this.props.isAdmin ?
                "Настройка" :
                "Цены и бронирование"
            }
          </a>
        </Link>
      </div>
    );
  }
}

class Rooms extends React.Component {
  constructor(props) {
    super(props);

    this.state = new Object();

    getApiResponse('/rooms', {
      isUtility: false
    })
      .then(res => {
        this.setState((state, props) => {
          state.rooms = new Array();

          for (let i = 0; i < res.length; i += 1) {
            for (let j = 0; j < res[i].images.length; j += 1) {
              res[i].images[j] = {
                url: res[i].images[j].url,
                width: res[i].images[j].width,
                height: res[i].images[j].height
              };
            }

            state.rooms.push(
              <Room
                name={res[i].name}
                description={res[i].description}
                images={res[i].images}
                isAdmin={this.props.isAdmin}
                key={i}
              />
            );
          }

          return state;
        });
      });

    this.correctHeight = () => {
      let element = document.getElementsByClassName('news-container')[0];
      element.style.setProperty('--max-height', element.previousElementSibling.offsetHeight + 'px');
    }

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }

  componentDidMount() {
    this.correctHeight();

    window.addEventListener('resize', this.correctHeight);
  }

  componentDidUpdate() {
    this.correctHeight();
  }

  render() {
    return (
      <div className="rooms-container">
        <h2>Номера</h2>
        {this.state.rooms || <Loader />}
      </div>
    );
  }
}

export default function({ main, socket }) {
  return (
    <main>
      <IntroductionDiv content={main}/>
      <AnonymousAnnouncement user={socket.user} />
      <div className="content-flex-wrapper">
        <Rooms isAdmin={socket.user.isRoot} />
        <News isAdmin={socket.user.isRoot} />
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