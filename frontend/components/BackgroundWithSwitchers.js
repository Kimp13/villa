import react from 'react';

import '../public/styles/components/backgroundWithSwitchers.scss';

export default class BackgroundWithSwitchers extends React.Component {
  constructor(props) {
    super(props);
    this.backgrounds = props.backgrounds;
    this.state = {
      index: 0
    }
    this.switchBGs = this.switchBGs.bind(this);
    [this.activeBG, this.previousBG] = [React.createRef(), React.createRef()]
  }

  switchBGs(event) {
    let newBackground;
    event.currentTarget.classList.contains('right') ? this.state.index += 1 : this.state.index -= 1;
    if (this.state.index >= this.backgrounds.length) {
      this.state.index = 0;
    } else if (this.state.index < 0) {
      this.state.index = this.backgrounds.length - 1;
    }
    newBackground = this.backgrounds[this.state.index];
    this.previousBG.current.style.backgroundImage = `url(${newBackground})`;
    this.activeBG.current.classList.remove('active');
    this.activeBG.current.classList.add('previous');
    this.previousBG.current.classList.remove('previous');
    this.previousBG.current.classList.add('active');
    [this.activeBG, this.previousBG] = [this.previousBG, this.activeBG];
  }

  render() {
    return (
      <React.Fragment>
        <div className="switcher left" onClick={this.switchBGs}>
          <i className="fas fa-caret-left" />
        </div>
        <div className="switcher right" onClick={this.switchBGs}>
          <i className="fas fa-caret-right" />
        </div>
        <div ref={this.activeBG} className="active background" style={{backgroundImage: `url(${this.backgrounds[0]})`}} onTouchMove={(event) => console.log(event)} />
        <div ref={this.previousBG} className="previous background" />
      </React.Fragment>
    );
  }
}