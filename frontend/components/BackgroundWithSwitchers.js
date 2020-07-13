import react from 'react';

import '../public/styles/components/backgroundWithSwitchers.module.scss';

export default class BackgroundWithSwitchers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      leftOffset: 0,
      rightOffset: 0,
      index: 0
    };

    this.backgroundContainer = React.createRef();

    this.componentDidMount = this.componentDidMount.bind(this);
    this.switchBGs = this.switchBGs.bind(this);
    this.centerImage = this.centerImage.bind(this);
    this.centerImageWithoutAnimation = this.centerImageWithoutAnimation.bind(this);
    this.operateImages = this.operateImages.bind(this);
  }

  componentDidMount() {
    let leftSum = 0, rightSum = 0,
        parentWidth = this.backgroundContainer.current.parentNode.offsetWidth,
        containerHeight = this.backgroundContainer.current.offsetHeight;

    while (leftSum < parentWidth) {
      let leftIndex = this.props.backgrounds.length - 1 - this.state.leftOffset % this.props.backgrounds.length,
          leftImage = document.createElement('img');

      this.state.leftOffset += 1;

      leftImage.setAttribute('src', this.props.backgrounds[leftIndex]);
      leftImage.setAttribute('alt', '');
      leftImage.classList.add('bg-image');

      this.backgroundContainer.current.prepend(leftImage);

      leftSum += (leftImage.naturalWidth / leftImage.naturalHeight) * containerHeight;
    }
    while (rightSum < parentWidth * 1.5) {
      let rightIndex = (this.state.rightOffset % this.props.backgrounds.length),
          rightImage = document.createElement('img');

      this.state.rightOffset += 1;

      rightImage.setAttribute('src', this.props.backgrounds[rightIndex]);
      rightImage.setAttribute('alt', '');
      rightImage.classList.add('bg-image');

      this.backgroundContainer.current.append(rightImage);
      rightSum += (rightImage.naturalWidth / rightImage.naturalHeight) * containerHeight;
    }

    let centerImage = this.backgroundContainer.current.children[this.state.leftOffset];

    this.state.currentTranslate = ((parentWidth  - centerImage.clientWidth) / 2) - leftSum;
    this.state.currentWidth = leftSum + rightSum;

    this.centerImageWithoutAnimation({
      translate: this.state.currentTranslate,
      width: this.state.currentWidth
    });
  }

  operateImages(movingRight, { parentWidth, childrenWidth }) {
    let currentImage = this.backgroundContainer.current.children[this.state.leftOffset + this.state.index];

    if (movingRight) {
      let removedImagesWidth = 0;

      while ((childrenWidth - this.backgroundContainer.current.children[0].clientWidth) > parentWidth + this.backgroundContainer.current.children[1].clientWidth) {
        removedImagesWidth += this.backgroundContainer.current.children[0].clientWidth;
        childrenWidth -= this.backgroundContainer.current.children[0].clientWidth;

        this.backgroundContainer.current.children[0].remove();
        this.state.leftOffset -= 1;
      }

      this.state.currentWidth -= removedImagesWidth;
      let widthDifference = this.state.currentWidth - childrenWidth,
          index,
          img;

      while (widthDifference < parentWidth) {
        img = document.createElement('img');
        if (this.state.rightOffset >= 0) {
          index = this.state.rightOffset % this.props.backgrounds.length;
        } else {
          index = (this.props.backgrounds.length - (-this.state.rightOffset) % this.props.backgrounds.length) % this.props.backgrounds.length;
        }
        img.src = this.props.backgrounds[index];
        img.classList.add('bg-image');

        this.backgroundContainer.current.append(img);
        this.state.rightOffset += 1;

        widthDifference += img.clientWidth;
      }
      this.centerImageWithoutAnimation({
        translate: this.state.currentTranslate + removedImagesWidth,
        width: widthDifference + childrenWidth
      });

    } else {

      let widthDifference = this.state.currentWidth - childrenWidth,
          lastChildIndex = this.backgroundContainer.current.childElementCount - 1;

      while ((widthDifference - this.backgroundContainer.current.children[lastChildIndex].clientWidth) > parentWidth + this.backgroundContainer.current.children[lastChildIndex - 1].clientWidth) {
        widthDifference -= this.backgroundContainer.current.children[lastChildIndex].clientWidth;

        this.backgroundContainer.current.children[lastChildIndex].remove();

        lastChildIndex -= 1;
        this.state.rightOffset -= 1;
      }

      let img,
          addedImagesWidth = 0,
          index;

      while (childrenWidth < parentWidth) {
        img = document.createElement('img');
        if (this.state.leftOffset >= 0) {
          index = this.props.backgrounds.length - 1 - this.state.leftOffset % this.props.backgrounds.length;
        } else {
          index = (this.state.leftOffset + 1) % (-this.props.backgrounds.length);
        }
        img.src = this.props.backgrounds[index];
        img.classList.add('bg-image');

        this.backgroundContainer.current.prepend(img);
        this.state.leftOffset += 1;

        childrenWidth += img.clientWidth;
        addedImagesWidth += img.clientWidth;
      }
      this.centerImageWithoutAnimation({
        translate: this.state.currentTranslate - addedImagesWidth,
        width: childrenWidth + widthDifference
      });

    }

    return childrenWidth;
  }

  centerImageWithoutAnimation({ translate, width }) {
    this.backgroundContainer.current.style.transform = `translateX(${translate}px)`;
    this.backgroundContainer.current.style.width = `${width}px`;
    this.state.currentTranslate = translate;
    this.state.currentWidth = width;
  }

  centerImage(movingRight = true) {
    let parentWidth = this.backgroundContainer.current.parentNode.offsetWidth,
        childrenWidth = this.backgroundContainer.current.children[0].offsetWidth / 2;

    for (let i = 1; i <= this.state.leftOffset + this.state.index; i += 1) {
      childrenWidth += this.backgroundContainer.current.children[i - 1].offsetWidth / 2;
      childrenWidth += this.backgroundContainer.current.children[i].offsetWidth / 2;
    }

    childrenWidth = this.operateImages(movingRight, { parentWidth, childrenWidth });

    this.state.currentTranslate = (parentWidth / 2) - childrenWidth;

    this.backgroundContainer.current.style.setProperty('--translateTo', `${this.state.currentTranslate}px`);
    this.backgroundContainer.current.style.animation = 'translateTo .3s ease forwards';
  }

  switchBGs(event) {
    let target = event.target, movingRight;

    this.backgroundContainer.current.style.animation = '';

    while (target.nodeName != 'DIV') {
      target = target.parentNode;
    }
    movingRight = (target.classList.contains('right'))
    this.state.index += movingRight ? 1 : -1;
    this.centerImage(movingRight);
  }

  render() {
    return (
      <>
        <div className="switcher left" onClick={this.switchBGs}>
          <i className="fas fa-caret-left" />
        </div>
        <div className="switcher right" onClick={this.switchBGs}>
          <i className="fas fa-caret-right" />
        </div>
        <div className="bg-container" ref={this.backgroundContainer} />
      </>
    );
  }
}