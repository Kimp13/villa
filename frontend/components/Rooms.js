import React from "react";
import Link from "next/link";
import BackgroundWithSwitchers from "../components/BackgroundWithSwitchers.js";

import { getFullLink } from "../libraries/requests";
import { shortenTextTo } from "../libraries/texts";

import "../public/styles/components/rooms.module.scss";

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.name = props.name;
    this.description = shortenTextTo(this.props.description, 100);
  }

  render() {
    return (
      <div className="room">
        <h3>
          {this.name}
        </h3>
        <div className="room-photos-wrapper">
          <BackgroundWithSwitchers backgrounds={this.props.photos} />
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