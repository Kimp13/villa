import React from "react";
import "../public/styles/introductionDiv.scss";

class Switchers extends React.Component {
  constructor(props) {
    super(props);
    this.forwards = props.forwards;
    this.state = props.state;
    this.backgrounds = props.backgrounds;
    this.switchBGs = this.switchBGs.bind(this);
  }

  switchBGs(event) {
    let wrapper = document.getElementsByClassName('introduction')[0],
        activeBG = wrapper.querySelector('.active'),
        previousBG = wrapper.querySelector('.previous'),
        newBackground;
    event.currentTarget.classList.contains('right') ? this.state.index += 1 : this.state.index -= 1;
    if (this.state.index >= this.backgrounds.length) {
      this.state.index = 0;
    } else if (this.state.index < 0) {
      this.state.index = this.backgrounds.length - 1;
    }
    newBackground = this.backgrounds[this.state.index];
    previousBG.style.backgroundImage = `url(${newBackground})`;
    activeBG.classList.remove('active');
    activeBG.classList.add('previous');
    previousBG.classList.remove('previous');
    previousBG.classList.add('active');
  }

  render() {
    return (
      <React.Fragment>
        <div className="switcher left" onClick={this.switchBGs} />
        <div className="switcher right" onClick={this.switchBGs} />
      </React.Fragment>
    );
  }
}

export default class IntroductionDiv extends React.Component {
  constructor(props) {
    super(props);
    this.children = props.children;
    this.backgrounds = props.backgrounds;
    this.content = props.content;
    this.state = {background: this.backgrounds[0], index: 0};
  }

  render() {
    if (this.backgrounds) {
      return (
        <div className="introduction" onClick={this.switchBGs}>
          <div className="introduction-content">
            <h1>
              {this.content.header}
              <button className="introduction-content-close">
                ❌
              </button>
            </h1>
            <p>
              {this.content.description}
            </p>
          </div>
          <Switchers state={this.state} backgrounds={this.backgrounds} />
          <div className="active background" style={{backgroundImage: `url(${this.state.background})`}} />
          <div className="previous background" />
        </div>
      );
    }
    return null;
  }
}