import React from "react";
import Link from "next/link";
import BackgroundWithSwitchers from "../components/BackgroundWithSwitchers.js";

import { getFullLink } from "../libraries/requests";
import { shortenTextTo } from "../libraries/texts";

import "../public/styles/components/rooms.scss";

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.name = props.name;
    this.description = shortenTextTo(this.props.description, 100);
    this.photos = props.photos;
    this.photosWrapper = React.createRef();
  }

  componentDidMount() {
    this.photosWrapper.current.style.height = this.photosWrapper.current.getBoundingClientRect().width * 0.8 + 'px';
    window.addEventListener('resize', () => {
      try {
        this.setState({
          photosWrapperHeight: this.photosWrapper.current.getBoundingClientRect().width * 0.8 + 'px'
        });
      } catch (e) {
        console.log(e);
      }
    });
  }

  render() {
    return (
      <div className="room">
        <h3>
          {this.name}
        </h3>
        <div className="room-photos-wrapper" ref={this.photosWrapper} style={this.state ? {height: this.state.photosWrapperHeight} : {}}>
          <BackgroundWithSwitchers backgrounds={this.photos} />
        </div>
        <p className="room-description">
          {this.description}
        </p>
        <Link href={ `/room/[name]` } as={ `/room/${this.name}`} >
          <a  className="room-link">
            Цены и бронирование
          </a>
        </Link>
      </div>
    );
  }
}

export default class Rooms extends React.Component {
  constructor(props) {
    super(props);
    this.rooms = props.content;
  }

  render() {
    let childrenRooms = Array();
    for(let i = 0; i < this.rooms.length; i += 1) {
      let photos = Array();
      for(let image of this.rooms[i].images) {
        photos.push(getFullLink(image.url));
      }
      childrenRooms.push(<Room key={i} name={this.rooms[i].name} description={this.rooms[i].description} photos={photos}/>);
    }
    return (
      <div className="rooms-container">
        <h2>
          Наши номера
        </h2>
        {childrenRooms}
      </div>
    )
  }
}