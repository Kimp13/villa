import React from "react";
import Link from "next/link";
import "../public/styles/header.scss";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    window.previousScroll = 0;
    window.addEventListener('scroll', this.handleScroll, true);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const header = document.getElementById('header');
    if (this.previousScroll > this.scrollY) {
      if (header.classList.contains('hidden')) {
        header.classList.remove('hidden');
      }
    } else {
      if (!header.classList.contains('hidden')) {
        header.classList.add('hidden');
      }
    }
    this.previousScroll = this.scrollY;
  }

  render() {
    return (
      <div id="header">
        <Link href="/">
          <a>
            <p className="big">
              Villa
            </p>
            <p className="humiliated">
              Guest House
            </p>
            <p className="humiliated">
              На главную
            </p>
          </a>
        </Link>
        <Link href="/about">
          <a>О Вилле</a>
        </Link>
        <Link href="/route">
          <a>Как добраться</a>
        </Link>
      </div>
    )
  }
}