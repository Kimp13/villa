import React from "react";

import { getApiResponse } from "../../libraries/requests.js";

import styles from "../../public/styles/pages/rooms/index.module.scss";

export async function getStaticProps() {
  let rooms = await getApiResponse('/villa/getRooms', {isUtility: false});

  return {
    props: {
      rooms,
      title: 'Номера',
      footerEnabled: true
    }
  }
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chosenIndex: null,
      firstTime: true,
      loaded: false
    };

    this.componentDidMount = () => {
      this.setState(state => {
        state.loaded = true;

        return state;
      });
    };

    this.proceed = () => {
      window.location.href = `/rooms/${this.props.rooms[this.state.chosenIndex].name}`;
    };

    this.choose = this.choose.bind(this);
  }

  choose(event) {
    let target = event.target, counter = 0;

    while (target.nodeName !== 'DIV') {
      target = target.parentNode;
    }

    while (target.previousElementSibling !== null) {
      target = target.previousElementSibling;
      counter += 1;
    }

    this.setState(state => {
      state.chosenIndex = counter;

      return state;
    });
  }

  render() {
    let firstButton, rooms = new Array();

    if (this.state.loaded) {
      if (history.length === 1) {
        firstButton = (
          <button className="back button disabled">
            Обратно бежать некуда :_(
          </button>
        );
      } else {
        firstButton = (
          <button className="back button" onClick={() => history.back()}>
            Пустите меня обратно!
          </button>
        );
      }

      if (this.props.rooms.length === 0) {
        rooms.push(
          <p className="rooms-content-paragraph" key="n">
            К сожалению, мы не нашли номеров :(
          </p>
        );
      } else {
        let animations = [
          'goDown',
          'goLeft',
          'goUp',
          'goRight'
        ];

        for (let i = 0; i < this.props.rooms.length; i += 1) {
          if (this.state.chosenIndex === i) {
            rooms.push(
              <div className="rooms-content-node chosen" key={i}>
                <h3 className="rooms-content-node-name">
                  {this.props.rooms[i].name}
                </h3>
                <p className="rooms-content-node-header">
                  {this.props.rooms[i].header}
                </p>
              </div>
            );
          } else {
            let style = {
              animationDelay: `${100 * i}ms`
            };

            rooms.push(
              <div
                className="rooms-content-node"
                onClick={this.choose}
                style={style}
                key={i}
              >
                <h3 className="rooms-content-node-name">
                  {this.props.rooms[i].name}
                </h3>
                <p className="rooms-content-node-header">
                  {this.props.rooms[i].header}
                </p>
              </div>
            );
          }
        }
      }
    } else {
      firstButton = null;
    }

    return (
      <main className="rooms">
        <h1 className="rooms-header">
          Выбери свой!
        </h1>
        <div className="rooms-content">
          {rooms}
        </div>
        {firstButton}
        <button
          className={"next button" + (this.state.chosenIndex === null ? " disabled" : "")}
          onClick={this.state.chosenIndex === null ? null : this.proceed}
        >
          {
            this.state.chosenIndex === null ?
              'Я выберу тебя, обязательно!' :
              this.props.rooms[this.state.chosenIndex].name + ', я выбираю тебя!'
          }
        </button>
      </main>
    );
  }
}