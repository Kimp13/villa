import React from "react";
import Layout from "../components/Layout";
import IntroductionDiv from "../components/IntroductionDiv";
import Loader from "../components/Loader";
import { getFullLink, getAPIResponse } from "../libraries/requests";

import "../public/styles/index.scss";

async function getStaticProps() {
  let backgrounds = await getAPIResponse('/blobs', [{key: 'relation', value: 'background'}]);
  return {
    props: {
      backgrounds,
    },
  }
}

class Rooms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: []
    };
  }

  render() {
    if (this.state) {
      let rooms = Array();
      for(let room of this.state.rooms) {
        let photos = Array();
        for(let image of room.images) {
          photos.push(getFullLink(image.url));
        }
        rooms.push(<Room name={room.name} description={room.description} photos={photos} priceInfo={room.priceInfo} />);
      }
      return (
        <div className="rooms-container">
          <h2>
            Наши номера
          </h2>
          {rooms}
        </div>
      )
    }
    return null;
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

class AsyncWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.i = 0;
    let ready = false, backgrounds = Array(),
        query = [
          {
            key: 'relation',
            value: 'background'
          }
        ]

    getStaticProps()
      .then(data => {
        for (let background of data.props.backgrounds) {
          backgrounds.push(getFullLink(background.self.url));
        }
        this.setState({ready: true, backgrounds: backgrounds});
      });
    
  }

  render() {
    if (this.state !== null) {
      let content = {
        header: 'Гестхаус Villa на Фиоленте',
        description: 'Ну что рассказать? Домик. Просто домик, в котором живут его хозяева вместе с гостями, которые, в свою очередь, платят денежки :)'
      }
      return (
        <React.Fragment>
          <IntroductionDiv backgrounds={this.state.backgrounds} content={content}/>
          <div className="content-flex-wrapper">
            <Rooms />
            <News />
          </div>
        </React.Fragment>
      );
    }
    return <Loader animationDuration='1.6' />;
  }
}

export { getStaticProps };

export default () => <AsyncWrapper hello="world!" />;