import React from "react";
import Link from "next/link";

import style from "../public/styles/components/introductionDiv.module.scss";

import { getFullLink } from "../libraries/requests.js";

export default class IntroductionDiv extends React.Component {
  constructor(props) {
    super(props);

    this.introduction = React.createRef();

    this.componentDidMount = () => {
      this.introduction.current.addEventListener('animationiteration', this.incrementIndex);

      let phoneUs;

      if (this.props.content.id === 1) {
        let captions = [
          'Хотите получить незабываемые воспоминания от отдыха в Крыму?',
          'Хотите быть окутанными любовью и отличным отдыхом в Крыму?',
          'Хотите провести отдых в Крыму в шаговой доступности от Яшмового пляжа?'
        ];

        phoneUs = captions[Math.floor(captions.length * Math.random())];
      } else {
        phoneUs = 'Позвони...';
      }

      this.setState((state, props) => ({
        backgroundIndex: 0,
        phoneUs
      }));
    };

    this.incrementIndex = e => {
      if (e.target.isSameNode(this.introduction.current)) {
        this.setState((state, props) => {
          if (state.backgroundIndex + 1 === props.content.images.length) {
            state.backgroundIndex = 0;
          } else {
            state.backgroundIndex += 1;
          }

          return state;
        });
      }
    }
  }

  render() {
    let style = null;

    if (this.state) {
      let photo = this.props.content.images[this.state.backgroundIndex],
          backgroundSize,
          width;

      width = photo.width / photo.height * window.innerHeight;

      if (width >= window.innerWidth) {
        backgroundSize = 'auto 100%';
      } else {
        backgroundSize = '100% auto';
      }

      style = {
        backgroundImage: `url(${photo.url})`,
        backgroundSize
      };
    }

    return (
      <div
        className="introduction"
        style={style}
        ref={this.introduction}
      >
        <div className="introduction-content">
          <h1 className="introduction-content-header first">
            {this.props.content.name}
          </h1>
          <h2 className="introduction-content-header">
            {this.props.content.header}
          </h2>
          <div
            className="introduction-content-list"
            dangerouslySetInnerHTML={{__html: this.props.content.description}}
          />
          <div className="introduction-phone">
            <p className="introduction-phone-caption">
              <span
                dangerouslySetInnerHTML={{
                  __html: this.state ? this.state.phoneUs : null
                }}
              />
              <Link href="/phoneUs.js" as="/phoneUs">
                <a
                  className="a"
                  style={{
                    display: 'inline-block',
                    marginLeft: '.3rem',
                    marginRight: '.3rem'
                  }}
                >
                  Просто позвоните нам
                </a>
              </Link>
              и забронируйте номер!
            </p>
            <div className="introduction-phone-link">
              <div className="introduction-phone-link-figure">
                <div className="introduction-phone-link-figure-circle" />
                <div className="introduction-phone-link-figure-circle" />
                <i className="fas fa-phone" />
              </div>
              <a
                className="a"
                href="tel:+79785025000"
              >
                +79785025000
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}