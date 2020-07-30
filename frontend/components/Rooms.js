import React, { useState, useEffect } from "react";
import Link from "next/link";
import BackgroundWithSwitchers from "../components/BackgroundWithSwitchers.js";

import { getApiResponse } from "../libraries/requests";
import { shortenTextTo } from "../libraries/texts";

import "../public/styles/components/rooms.module.scss";

class Room extends React.Component {
  constructor(props) {
    super(props);

    this.description = shortenTextTo(this.props.description, 100);
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
            Цены и бронирование
          </a>
        </Link>
      </div>
    );
  }
}

export default function () {
  let roomElements = Array(),
      [rooms, setRooms] = useState([]);

  useEffect(() => {
    getApiResponse('/rooms', {
      isUtility: false
    })
      .then(res => {
        for (let i = 0; i < res.length; i += 1) {
          for (let j = 0; j < res[i].images.length; j += 1) {
            res[i].images[j] = {
              url: res[i].images[j].url,
              width: res[i].images[j].width,
              height: res[i].images[j].height
            };
          }

          res[i] = {
            name: res[i].name,
            description: res[i].description,
            images: res[i].images
          }
        }

        setRooms(res);
      });
  }, []);

  for (let i = 0; i < rooms.length; i += 1) {
    roomElements.push(<Room {...rooms[i]} key={i} />);
  }

  return (
    <div className="rooms-container">
      {roomElements}
    </div>
  );
};