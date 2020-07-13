import React from "react";
import BackgroundWithSwitchers from '../components/BackgroundWithSwitchers.js'

import "../public/styles/components/introductionDiv.module.scss";

import { getFullLink } from "../libraries/requests.js";

export default class IntroductionDiv extends React.Component {
  constructor(props) {
    super(props);
    this.backgrounds = this.props.content.images.map(imageInfo => getFullLink(imageInfo.url));
    this.state = {background: this.backgrounds[0], index: 0};
    this.componentDidMount = this.componentDidMount.bind(this);
    this.hideContent = this.hideContent.bind(this);
    this.showContent = this.showContent.bind(this);
  }

  componentDidMount() {
    this.content = document.getElementsByClassName('introduction-content')[0];
    this.showButton = document.getElementsByClassName('introduction-content-open')[0];
  }

  hideContent() {
    this.content.classList.add('hidden');
    this.showButton.classList.remove('hidden');
  }

  showContent() {
    this.content.classList.remove('hidden');
    this.showButton.classList.add('hidden');
  }

  render() {
    if (this.backgrounds) {
      return (
        <div className="introduction" onClick={this.switchBGs}>
          <div className="introduction-content">
            <h1>
              {this.props.content.descriptionHeader}
              <button className="introduction-content-close" onClick={this.hideContent}>
                ❌
              </button>
            </h1>
            <p>
              {this.props.content.description}
            </p>
          </div>
          <button className="introduction-content-open hidden" onClick={this.showContent}>
            <i className="fas fa-angle-double-up" />
          </button>
          <BackgroundWithSwitchers backgrounds={this.backgrounds} wrapperSelector={'.introduction'} />
          
        </div>
      );
    }
    return null;
  }
}