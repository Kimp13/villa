import "../public/styles/components/changingBackgrounds.module.scss";

export default class extends React.Component {
  constructor(props) {
    super(props);

    let noMovements;

    if (this.props.backgrounds.length === 0) {
      this.state = {
        noMovements: true,
        backgrounds: [{
          url: '/images/no-photo.jpg',
          width: 640,
          height: 360
        }]
      };

      return;
    }

    if (this.props.backgrounds.length === 1) {
      noMovements = true;
    }

    this.state = {
      delay: this.props.delay || 5000,
      backgrounds: this.props.backgrounds,
      noMovements,
      currentIndex: 0,
      previousIndex: this.props.backgrounds.length - 1
    };

    this.componentDidMount = () => {
      if (this.props.captionRef && this.props.captionRef.current) {
        this.props.captionRef.current.innerHTML =
          this.state.backgrounds[this.state.currentIndex].caption || '';
      }
    };

    setInterval(() => {
      this.setState((state, props) => {
        state.previousIndex = state.currentIndex;

        if (state.currentIndex + 1 === state.backgrounds.length) {
          state.currentIndex = 0;
        } else {
          state.currentIndex += 1;
        }

        if (props.captionRef) {
          props.captionRef.current.innerHTML =
            state.backgrounds[state.currentIndex].caption || '';
        }

        return state;
      });
    }, this.state.delay);
  }

  render() {
    if (this.state.noMovements) {
      return (
        <div
          className="no-changing-background"
          style={{
            backgroundImage: `url(${this.state.backgrounds[0].url})`,
            backgroundSize: 'cover'
          }}
        />
      );
    }

    let caption;

    if (this.props.captionEnabled) {
      caption = (
        <p
          className="changing-background-caption"
          style={{
            animationDuration: this.state.delay + 'ms',
          }}
        >
          {this.state.backgrounds[this.state.currentIndex].caption || ''}
        </p>
      );
    }

    const curPhoto = this.state.backgrounds[this.state.currentIndex];
    let relation, backgroundSize, hoverBackgroundSize;

    if (curPhoto.width / curPhoto.height >= 1.778) {
      relation = curPhoto.width / (0.01778 * curPhoto.height);
      backgroundSize = `${relation}% 100%`;
      hoverBackgroundSize = `100% ${10000 / relation}%`;
    } else {
      relation = (curPhoto.height * 177.8) / curPhoto.width;
      backgroundSize = `100% ${relation}%`;
      hoverBackgroundSize = `${10000 / relation}% 100%`;
    }

    return (
      <React.Fragment>
        <div 
          className="changing-background"
          style={{
            backgroundImage: `url(${curPhoto.url})`,
            animationName: 'changeOpacity',
            animationDuration: this.state.delay + 'ms',
            '--background-size': backgroundSize,
            '--hover-background-size': hoverBackgroundSize
          }}
        />
        {caption}
      </React.Fragment>
    );
  }
}